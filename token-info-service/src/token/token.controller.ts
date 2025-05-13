import {
  Controller,
  Get,
  Param,
  UseGuards,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TokenService } from './token.service';
import { RateLimitGuard } from '../rate-limit/rate-limit.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';

@ApiTags('token')
@Controller('token')
@UseGuards(RateLimitGuard)
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get(':address')
  @ApiOperation({ summary: 'Get token information' })
  @ApiHeader({
    name: 'x-access-key',
    description: 'Access key for rate limiting',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Token information retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Access key is required' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  async getTokenInfo(
    @Param('address') address: string,
    @Headers('x-access-key') accessKey: string,
  ) {
    // Validate access key
    const isValid = await this.tokenService.validateAccessKey(accessKey);
    if (!isValid) {
      throw new HttpException('Invalid access key', HttpStatus.UNAUTHORIZED);
    }

    // Get token information
    return this.tokenService.getTokenInfo(address);
  }
}
