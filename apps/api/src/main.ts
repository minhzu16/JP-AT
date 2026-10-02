import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load root .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global Prefix
  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'ready', 'api/docs'],
  });

  // Enable CORS
  app.enableCors({
    origin: process.env.WEB_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global RFC 7807 Error Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Job Portal & Application Tracker API')
    .setDescription('Production-ready REST API for Job Board and Applicant Tracking System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`🚀 API Server running on http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger documentation available at http://localhost:${port}/api/docs`);
  logger.log(`❤️ Health check available at http://localhost:${port}/health`);
}
bootstrap();
