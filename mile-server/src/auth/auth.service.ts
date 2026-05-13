import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import type { SignOptions } from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email is already registered.');
    }

    const passwordHash = await hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        timezone: dto.timezone ?? 'UTC',
        locale: dto.locale ?? 'ko-KR',
        workspaces: {
          create: [
            {
              name: 'Personal',
              type: 'PERSONAL',
              color: '#2563eb',
              icon: 'user',
            },
            {
              name: 'Work',
              type: 'WORK',
              color: '#059669',
              icon: 'briefcase',
            },
          ],
        },
      },
      include: {
        workspaces: true,
      },
    });

    return {
      user: this.toPublicUser(user),
      workspaces: user.workspaces,
      tokens: await this.issueTokens(user.id, user.email),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { workspaces: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return {
      user: this.toPublicUser(user),
      workspaces: user.workspaces,
      tokens: await this.issueTokens(user.id, user.email),
    };
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
      }>(dto.refreshToken, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ??
          'change-me-refresh-secret',
      });

      return {
        tokens: await this.issueTokens(payload.sub, payload.email),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token.');
    }
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { workspaces: true },
    });

    return {
      user: this.toPublicUser(user),
      workspaces: user.workspaces,
    };
  }

  logout() {
    return { success: true };
  }

  private async issueTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret:
          this.configService.get<string>('JWT_ACCESS_SECRET') ??
          'change-me-access-secret',
        expiresIn: (this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ??
          '15m') as SignOptions['expiresIn'],
      }),
      this.jwtService.signAsync(payload, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ??
          'change-me-refresh-secret',
        expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ??
          '30d') as SignOptions['expiresIn'],
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private toPublicUser(user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    timezone: string;
    locale: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      timezone: user.timezone,
      locale: user.locale,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
