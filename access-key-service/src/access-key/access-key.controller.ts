import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AccessKeyService } from './access-key.service';
import { CreateAccessKeyDto } from './dto/create-access-key.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('keys')
export class AccessKeyController {
  constructor(private readonly accessKeyService: AccessKeyService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createAccessKey(@Body() dto: CreateAccessKeyDto) {
    return this.accessKeyService.createAccessKey(dto);
  }

  @Get(':key')
  async getAccessKey(@Param('key') key: string) {
    return this.accessKeyService.getAccessKey(key);
  }

  @Post(':key/disable')
  async disableAccessKey(@Param('key') key: string) {
    return this.accessKeyService.disableAccessKey(key);
  }

  @Delete(':key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteAccessKey(@Param('key') key: string) {
    return this.accessKeyService.deleteAccessKey(key);
  }

  @Patch(':key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateAccessKey(
    @Param('key') key: string,
    @Body() dto: Partial<CreateAccessKeyDto>,
  ) {
    return this.accessKeyService.updateAccessKey(key, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async listAccessKeys() {
    return this.accessKeyService.listAccessKeys();
  }
}
