import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import { TokenService } from '../auth/token/token.service';
import { ConfigService } from '@nestjs/config';
import { GameService } from './game.service';
import { PositionDto } from './position.dto';
import * as url from 'url';

interface ClientWithMeta extends WebSocket {
  userId?: string;
}

@Injectable()
export class GameGateway implements OnModuleInit, OnModuleDestroy {
  private wss: Server;
  private readonly PORT = 6002;

  constructor(
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly gameService: GameService
  ) {}

  onModuleInit() {
    this.wss = new Server({ port: this.PORT });
    this.setupWebSocketHandlers();
    console.log(`🟢 WebSocket server started on ws://localhost:${this.PORT}`);
  }

  onModuleDestroy() {
    this.wss?.close();
  }

  private setupWebSocketHandlers() {
    this.wss.on('connection', (ws: ClientWithMeta, req) => {
      this.handleConnection(ws, req);
    });
  }

  private handleConnection(ws: ClientWithMeta, req: any) {
    const token = this.extractTokenFromRequest(req);

    if (!token) {
      console.log('❌ Token missing, closing connection');
      ws.close();
      return;
    }

    try {
      const decoded = this.tokenService.verifyToken(token, this.configService.get<string>('JWT_ACCESS_SECRETKEY'));
      ws.userId = decoded.sub || decoded.id;
      console.log(`✅ Connected: user ${ws.userId}`);

      this.setupMessageHandlers(ws);
    } catch (err) {
      console.log('❌ Invalid token, closing connection');
      ws.close();
    }
  }

  private extractTokenFromRequest(req: any): string | null {
    const parsedUrl = url.parse(req.url || '', true);
    return (parsedUrl.query.token as string) || null;
  }

  private setupMessageHandlers(ws: ClientWithMeta) {
    ws.on('message', (message) => {
      this.handleMessage(ws, message);
    });

    ws.on('close', () => {
      this.handleDisconnection(ws);
    });
  }

  private handleMessage(ws: ClientWithMeta, message: any) {
    try {
      const data = JSON.parse(message.toString());

      this.handlePlayerMove(ws, data);
    } catch (err) {
      console.error('❌ Invalid message format:', err);
    }
  }

  private handlePlayerMove(ws: ClientWithMeta, data: any) {
    if (!ws.userId) {
      ws.close();
      return;
    }

    const position: PositionDto = {
      pos: data.pos,
      rot: data.rot,
    };

    // Update player position in game service
    this.gameService.updatePlayer(ws.userId, position);

    // Broadcast to other players
    this.broadcastPlayerUpdate(ws, ws.userId, position);
  }

  private broadcastPlayerUpdate(sender: ClientWithMeta, userId: string, position: PositionDto) {
    const payload = {
      type: 'updatePlayer',
      id: userId,
      pos: position.pos,
      rot: position.rot,
    };

    this.wss.clients.forEach((client: ClientWithMeta) => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(payload));
      }
    });
  }

  private handleDisconnection(ws: ClientWithMeta) {
    if (ws.userId) {
      console.log(`🔴 Disconnected: user ${ws.userId}`);
      this.gameService.removePlayer(ws.userId);
    }
  }
}
