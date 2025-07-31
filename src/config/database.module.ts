import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@app/database/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        url: configService.get<string>('DB_MYSQL_URL'),
        synchronize: configService.get<boolean>('DB_MYSQL_SYNCHRONIZE'),
        logging: configService.get<boolean>('DB_MYSQL_LOGGING'),
        entities: [UserEntity],
        charset: 'utf8mb4',
        timezone: 'Z',
      }),
    }),
  ],
})
export class DatabaseModule {}
