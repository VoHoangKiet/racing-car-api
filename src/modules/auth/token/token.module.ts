import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@app/database/schemas/user.schema';

@Module({
  imports: [JwtModule, ConfigModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
