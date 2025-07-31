import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@Entity/user.entity';

@Module({
  imports: [JwtModule, ConfigModule, TypeOrmModule.forFeature([UserEntity])],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
