import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisModule } from '../redis/redis.module';
import { AccessKeyController } from './access-key.controller';
import { AccessKeyService } from './access-key.service';

@Module({
  imports: [RedisModule],
  controllers: [AccessKeyController],
  providers: [AccessKeyService, PrismaService],
  exports: [AccessKeyService],
})
export class AccessKeyModule {}
