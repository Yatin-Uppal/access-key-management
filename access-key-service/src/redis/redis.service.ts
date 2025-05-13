import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly publisher: Redis;
  private readonly subscriber: Redis;

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');

    this.publisher = new Redis(redisUrl);
    this.subscriber = new Redis(redisUrl);
  }

  async onModuleInit() {
    // Subscribe to channels
    await this.subscriber.subscribe('access-key-events');
  }

  async onModuleDestroy() {
    await this.publisher.quit();
    await this.subscriber.quit();
  }

  async publish(channel: string, message: string): Promise<void> {
    await this.publisher.publish(channel, message);
  }

  async subscribe(
    channel: string,
    callback: (message: string) => void,
  ): Promise<void> {
    this.subscriber.on('message', (ch, message) => {
      if (ch === channel) {
        callback(message);
      }
    });
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.publisher.set(key, value, 'EX', ttl);
    } else {
      await this.publisher.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.publisher.get(key);
  }

  async del(key: string): Promise<void> {
    await this.publisher.del(key);
  }

  async increment(key: string): Promise<number> {
    return this.publisher.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.publisher.expire(key, seconds);
  }
}
