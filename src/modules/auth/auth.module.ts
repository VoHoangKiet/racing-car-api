import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAccessTokenStrategy } from './strategies/jwt-access-token.strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
import { UserEntity } from '@app/database/entities/user.entity';
import { TokenModule } from './token/token.module';

@Module({
  imports: [PassportModule, TypeOrmModule.forFeature([UserEntity]), TokenModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtAccessTokenStrategy, JwtRefreshTokenStrategy, ConfigService],
})
export class AuthModule {}
