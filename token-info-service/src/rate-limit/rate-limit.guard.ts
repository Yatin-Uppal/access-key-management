import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessKey = request.headers['x-access-key'];

    if (!accessKey) {
      throw new HttpException(
        'Access key is required',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const maxRequests = this.configService.get<number>('RATE_LIMIT_MAX', 100);
    const currentCount =
      await this.redisService.incrementRequestCount(accessKey);

    if (currentCount > maxRequests) {
      throw new HttpException(
        'Rate limit exceeded. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Add rate limit info to request for logging/monitoring
    request.rateLimit = {
      current: currentCount,
      max: maxRequests,
      resetIn: await this.redisService.getRequestCount(accessKey),
    };

    return true;
  }
}
