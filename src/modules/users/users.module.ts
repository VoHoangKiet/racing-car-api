import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { User, UserSchema } from '../../database/schemas/user.schema';
import { UsersService } from '@UsersModule/users.service';
import { UsersController } from '@UsersModule/users.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersService, ConfigService],
  exports: [UsersService],
})
export class UsersModule {}
