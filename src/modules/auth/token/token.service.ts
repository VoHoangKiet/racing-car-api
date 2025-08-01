import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from '@app/database/schemas/user.schema';
import { UserPayloadDto } from '../dto/user-payload.dto';
import { JwtPayload } from '@Constant/types';
import { StatusEnum } from '@Constant/enums';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>
  ) {}

  /**
   * Generate access token
   */
  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRETKEY'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES'),
    });
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRETKEY'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES'),
    });
  }

  /**
   * Generate both access and refresh tokens
   */
  generateTokens(userPayloadDto: UserPayloadDto): { accessToken: string; refreshToken: string } {
    const payload: JwtPayload = { sub: userPayloadDto.id, email: userPayloadDto.email };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  /**
   * Save refresh token to user
   */
  async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken });
  }

  /**
   * Remove refresh token from user (logout)
   */
  async removeRefreshToken(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
  }

  /**
   * Validate refresh token and get user
   */
  async validateRefreshToken(token: string): Promise<User> {
    const user = await this.userModel.findOne({
      refreshToken: token,
      status: StatusEnum.ACTIVE,
      deletedAt: null,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return user;
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string, secret: string): any {
    try {
      return this.jwtService.verify(token, { secret });
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Get JWT payload from token
   */
  getPayloadFromToken(token: string, secret: string): JwtPayload {
    return this.verifyToken(token, secret);
  }
}
