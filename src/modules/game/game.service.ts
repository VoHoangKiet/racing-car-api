import { Injectable } from '@nestjs/common';
import { PositionDto } from './position.dto';

@Injectable()
export class GameService {
  private players = new Map<string, PositionDto>();

  updatePlayer(userId: string, position: PositionDto) {
    console.log('🟢 Update player position:', userId, position);
    this.players.set(userId, position);
  }

  removePlayer(userId: string) {
    this.players.delete(userId);
  }

  getAllPlayers(): Map<string, PositionDto> {
    return this.players;
  }

  getPlayer(userId: string): PositionDto | undefined {
    return this.players.get(userId);
  }

  getAllPlayersExcept(userId: string): PositionDto[] {
    return Array.from(this.players.entries())
      .filter(([id]) => id !== userId)
      .map(([, position]) => position);
  }
}
