import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateAccessKeyDto } from './dto/create-access-key.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AccessKeyService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private eventEmitter: EventEmitter2,
  ) {}

  async createAccessKey(dto: CreateAccessKeyDto) {
    const key = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + dto.expirationDays);

    const accessKey = await this.prisma.accessKey.create({
      data: {
        key,
        rateLimit: dto.rateLimit,
        expiresAt,
      },
    });

    // Publish event for token info service
    this.eventEmitter.emit('access-key.created', {
      key: accessKey.key,
      rateLimit: accessKey.rateLimit,
      expiresAt: accessKey.expiresAt,
    });

    return accessKey;
  }

  async getAccessKey(key: string) {
    const accessKey = await this.prisma.accessKey.findUnique({
      where: { key },
    });

    if (!accessKey) {
      throw new NotFoundException('Access key not found');
    }

    if (!accessKey.isActive) {
      throw new BadRequestException('Access key is disabled');
    }

    if (accessKey.expiresAt < new Date()) {
      throw new BadRequestException('Access key has expired');
    }

    return accessKey;
  }

  async disableAccessKey(key: string) {
    const accessKey = await this.prisma.accessKey.update({
      where: { key },
      data: { isActive: false },
    });

    // Publish event for token info service
    this.eventEmitter.emit('access-key.disabled', {
      key: accessKey.key,
    });

    return accessKey;
  }

  async deleteAccessKey(key: string) {
    const accessKey = await this.prisma.accessKey.delete({
      where: { key },
    });

    // Publish event for token info service
    this.eventEmitter.emit('access-key.deleted', {
      key: accessKey.key,
    });

    return accessKey;
  }

  async updateAccessKey(key: string, dto: Partial<CreateAccessKeyDto>) {
    const data: any = {};

    if (dto.rateLimit) {
      data.rateLimit = dto.rateLimit;
    }

    if (dto.expirationDays) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + dto.expirationDays);
      data.expiresAt = expiresAt;
    }

    const accessKey = await this.prisma.accessKey.update({
      where: { key },
      data,
    });

    // Publish event for token info service
    this.eventEmitter.emit('access-key.updated', {
      key: accessKey.key,
      rateLimit: accessKey.rateLimit,
      expiresAt: accessKey.expiresAt,
    });

    return accessKey;
  }

  async listAccessKeys() {
    return this.prisma.accessKey.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async incrementRequestCount(key: string) {
    const accessKey = await this.prisma.accessKey.update({
      where: { key },
      data: {
        requestCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });

    return accessKey;
  }
}
