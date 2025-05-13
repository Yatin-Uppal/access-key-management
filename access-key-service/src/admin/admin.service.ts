import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateAdmin(username: string, password: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return admin;
  }

  async login(username: string, password: string) {
    const admin = await this.validateAdmin(username, password);

    const payload = {
      sub: admin.id,
      username: admin.username,
      role: 'admin',
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async createAdmin(username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
  }
}
