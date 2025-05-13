import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Web3Service } from '../web3/web3.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly web3: Web3Service,
    private readonly configService: ConfigService,
  ) {}

  async getTokenInfo(address: string) {
    // Try to get from cache first
    const cachedInfo = await this.redis.getTokenInfo(address);
    if (cachedInfo) {
      return cachedInfo;
    }

    // Try to get from database
    const dbInfo = await this.prisma.tokenInfo.findUnique({
      where: { tokenAddress: address },
    });

    if (dbInfo) {
      // Check if we need to refresh the data
      const lastFetched = new Date(dbInfo.lastFetched);
      const now = new Date();
      const hoursSinceLastFetch =
        (now.getTime() - lastFetched.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastFetch < 24) {
        // Cache the data and return
        await this.redis.setTokenInfo(address, dbInfo, 3600); // Cache for 1 hour
        return dbInfo;
      }
    }

    // Fetch fresh data from blockchain
    try {
      const tokenInfo = await this.web3.getTokenInfo(address);
      
      // Convert bigint values to strings for database storage
      const processedTokenInfo = {
        ...tokenInfo,
        metadata: {
          network: {
            id: tokenInfo.metadata.network.id.toString(),
            type: tokenInfo.metadata.network.type,
          },
          blockNumber: tokenInfo.metadata.blockNumber.toString(),
        },
      };

      // Save to database
      const savedInfo = await this.prisma.tokenInfo.upsert({
        where: { tokenAddress: address },
        update: {
          name: processedTokenInfo.name,
          symbol: processedTokenInfo.symbol,
          decimals: processedTokenInfo.decimals,
          totalSupply: processedTokenInfo.totalSupply,
          owner: processedTokenInfo.owner,
          metadata: processedTokenInfo.metadata,
          lastFetched: new Date(),
        },
        create: {
          tokenAddress: address,
          name: processedTokenInfo.name,
          symbol: processedTokenInfo.symbol,
          decimals: processedTokenInfo.decimals,
          totalSupply: processedTokenInfo.totalSupply,
          owner: processedTokenInfo.owner,
          metadata: processedTokenInfo.metadata,
        },
      });

      // Cache the data
      await this.redis.setTokenInfo(address, savedInfo, 3600); // Cache for 1 hour

      return savedInfo;
    } catch {
      if (dbInfo) {
        // If we have stale data, return it
        return dbInfo;
      }
      throw new NotFoundException(
        `Token information not found for address: ${address}`,
      );
    }
  }

  async validateAccessKey(accessKey: string): Promise<boolean> {
    // Check Redis cache first
    const cachedValidation = await this.redis.getTokenInfo(
      `access-key:${accessKey}`,
    );
    if (cachedValidation !== null) {
      return cachedValidation.isValid;
    }

    // Check database
    const validation = await this.prisma.accessKeyValidation.findUnique({
      where: { accessKey },
    });

    if (validation) {
      // Cache the validation result
      await this.redis.setTokenInfo(`access-key:${accessKey}`, validation, 300); // Cache for 5 minutes
      return validation.isValid;
    }

    // If not found, create a new validation record
    const newValidation = await this.prisma.accessKeyValidation.create({
      data: {
        accessKey,
        isValid: true, // We'll update this based on the access key service response
        lastChecked: new Date(),
      },
    });

    // Cache the validation result
    await this.redis.setTokenInfo(
      `access-key:${accessKey}`,
      newValidation,
      300,
    );

    return newValidation.isValid;
  }

  async updateAccessKeyValidation(
    accessKey: string,
    isValid: boolean,
  ): Promise<void> {
    // Update database
    await this.prisma.accessKeyValidation.upsert({
      where: { accessKey },
      update: {
        isValid,
        lastChecked: new Date(),
      },
      create: {
        accessKey,
        isValid,
        lastChecked: new Date(),
      },
    });

    // Update cache
    await this.redis.setTokenInfo(`access-key:${accessKey}`, { isValid }, 300);
  }

  async handleAccessKeyEvent(event: {
    type: string;
    data: any;
  }): Promise<void> {
    switch (event.type) {
      case 'created':
      case 'updated':
        await this.updateAccessKeyValidation(event.data.key, true);
        break;
      case 'disabled':
        await this.updateAccessKeyValidation(event.data.key, false);
        break;
      case 'deleted':
        await this.prisma.accessKeyValidation.delete({
          where: { accessKey: event.data.key },
        });
        await this.redis.invalidateTokenInfo(`access-key:${event.data.key}`);
        break;
    }
  }
}
