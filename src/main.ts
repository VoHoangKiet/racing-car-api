import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import 'dotenv/config';

import { AppModule } from '@app/app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { GameGateway } from './modules/game/game.gateway';

async function bootstrap() {
  const appOptions = { cors: true };
  const app = await NestFactory.create(AppModule, appOptions);

  const configService = app.get(ConfigService);

  // Pipes
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));

  //Register global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Prefix
  app.setGlobalPrefix('api/v1');

  const options = new DocumentBuilder()
    .setTitle('RACING CAR API')
    .setDescription('The Racing Car API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/docs', app, document);

  const port = configService.get<number>('PORT');
  const server = await app.listen(port || 8080);

  // Khởi tạo WebSocket server
  const gameGateway = app.get(GameGateway);
  gameGateway.initWithServer(server);
  console.log('🟢 WebSocket server started on same port as HTTP');
}

bootstrap();
