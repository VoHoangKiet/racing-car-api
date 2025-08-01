import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAccessTokenStrategy } from './strategies/jwt-access-token.strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
import { User, UserSchema } from '@app/database/schemas/user.schema';
import { TokenModule } from './token/token.module';

@Module({
  imports: [PassportModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), TokenModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtAccessTokenStrategy, JwtRefreshTokenStrategy, ConfigService],
})
export class AuthModule {}
