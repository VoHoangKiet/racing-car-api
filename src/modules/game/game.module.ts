import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { TokenModule } from '../auth/token/token.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TokenModule],
  providers: [GameGateway, GameService, ConfigService],
})
export class GameModule {}
