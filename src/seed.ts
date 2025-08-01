import { MongooseModule } from '@nestjs/mongoose';
import 'dotenv/config';
import { seeder } from 'nestjs-seeder';

import { DatabaseModule } from './config/database.module';
import { UserSeeder } from './database/seed/user.seed';
import { User, UserSchema } from '@app/database/schemas/user.schema';

seeder({
  imports: [DatabaseModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
}).run([UserSeeder]);
