import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
import * as express from 'express';

// Polyfill fetch for older Node.js versions (Render deployment)
if (!globalThis.fetch) {
  globalThis.fetch = require('node-fetch');
}

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
    process.env.FRONTEND_URL || 'https://music-app-web-five.vercel.app',
    'http://localhost:3000',
    'http://localhost:8000',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Log all origins for debugging
      console.log('CORS request from origin:', origin);
      console.log('Allowed origins:', allowedOrigins);

      if (!origin || allowedOrigins.includes(origin)) {
        console.log('✅ CORS allowed for origin:', origin);
        callback(null, true);
      } else {
        console.log('❌ CORS blocked for origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    exposedHeaders: 'Content-Type, Authorization',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const port = process.env.PORT || 8000;

  await app.listen(port);
}
bootstrap();
