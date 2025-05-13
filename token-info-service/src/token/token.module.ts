import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { Web3Module } from '../web3/web3.module';
import { RateLimitModule } from '../rate-limit/rate-limit.module';

@Module({
  imports: [PrismaModule, RedisModule, Web3Module, RateLimitModule],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
