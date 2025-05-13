import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly publisher: Redis;
  private readonly subscriber: Redis;

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {
    const redisUrl = this.configService.get<string>('REDIS_URL');

    this.publisher = new Redis(redisUrl);
    this.subscriber = new Redis(redisUrl);
  }

  async onModuleInit() {
    // Subscribe to access key events
    await this.subscriber.subscribe('access-key-events');

    // Handle incoming messages
    this.subscriber.on('message', (channel, message) => {
      if (channel === 'access-key-events') {
        try {
          const event = JSON.parse(message);
          this.eventEmitter.emit(`access-key.${event.type}`, event.data);
        } catch (error) {
          console.error('Error processing Redis message:', error);
        }
      }
    });
  }

  async onModuleDestroy() {
    await this.publisher.quit();
    await this.subscriber.quit();
  }

  // Rate limiting methods
  async incrementRequestCount(key: string): Promise<number> {
    const ttl = this.configService.get<number>('RATE_LIMIT_TTL', 60);
    const countKey = `rate-limit:${key}`;

    const multi = this.publisher.multi();
    multi.incr(countKey);
    multi.expire(countKey, ttl);

    const results = await multi.exec();
    return (results?.[0]?.[1] as number) || 0;
  }

  async getRequestCount(key: string): Promise<number> {
    const count = await this.publisher.get(`rate-limit:${key}`);
    return count ? parseInt(count, 10) : 0;
  }

  async resetRequestCount(key: string): Promise<void> {
    await this.publisher.del(`rate-limit:${key}`);
  }

  // Event publishing
  async publishEvent(
    channel: string,
    event: { type: string; data: any },
  ): Promise<void> {
    await this.publisher.publish(channel, JSON.stringify(event));
  }

  // Cache methods for token information
  async setTokenInfo(address: string, data: any, ttl?: number): Promise<void> {
    const key = `token-info:${address}`;
    if (ttl) {
      await this.publisher.set(key, JSON.stringify(data), 'EX', ttl);
    } else {
      await this.publisher.set(key, JSON.stringify(data));
    }
  }

  async getTokenInfo(address: string): Promise<any | null> {
    const data = await this.publisher.get(`token-info:${address}`);
    return data ? JSON.parse(data) : null;
  }

  async invalidateTokenInfo(address: string): Promise<void> {
    await this.publisher.del(`token-info:${address}`);
  }
}
