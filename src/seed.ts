import { TypeOrmModule } from '@nestjs/typeorm';
import 'dotenv/config';
import { seeder } from 'nestjs-seeder';

import { DatabaseModule } from './config/database.module';
import { UserSeeder } from './database/seed/user.seed';
import { UserEntity } from '@app/database/entities/user.entity';

seeder({
  imports: [DatabaseModule, TypeOrmModule.forFeature([UserEntity])],
}).run([UserSeeder]);
