import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import * as config from 'config';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);

  const server = config.get('server');
  console.log(server);

  await app.listen(3000);
  logger.log(`Application listening on port ${3000}`);
}
bootstrap();
