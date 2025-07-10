import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Disable default body parser to use custom limits
  });
  app.useGlobalPipes(new ValidationPipe());

  // Add cookie parser middleware
  app.use(cookieParser());
  app.use(graphqlUploadExpress({ maxFileSize: 1000000, maxFiles: 10 }));

  // Increase body size limit for base64 uploads
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:8000',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });
  await app.listen(process.env.PORT || 8000);
}
bootstrap();
