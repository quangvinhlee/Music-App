import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Allow frontend URL
    credentials: true, // Allow cookies & authentication headers
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });
  await app.listen(process.env.PORT || 8000);
}
bootstrap();
