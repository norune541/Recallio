import { Logger, StandardSchemaValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerModule,
  type SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { createSchema } from 'zod-openapi';
import { clerkMiddleware } from '@clerk/express';
import helmet from 'helmet';

import { AppModule } from './app.module.js';
import { env } from './config/env.js';

async function bootstrap() {
  const { PORT, CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY } = env;
  const BASE_URL = `http://localhost:${PORT}`;

  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.use(helmet());
  app.setGlobalPrefix('/api');
  app.use(
    clerkMiddleware({
      publishableKey: CLERK_PUBLISHABLE_KEY,
      secretKey: CLERK_SECRET_KEY,
      authorizedParties: ['http://localhost:5173'],
    }),
  );
  app.useGlobalPipes(new StandardSchemaValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Recallio API')
    .setDescription('Recallio API documentation')
    .setVersion('1.0')
    .build();

  const documentOptions: SwaggerDocumentOptions = {
    standardSchemaConverter: (schema, { schemaType }) => {
      const converted = createSchema(schema as never, {
        io: schemaType,
        openapiVersion: '3.0.0',
      });

      return {
        schema: converted.schema,
        components: converted.components,
      };
    },
  };

  const document = SwaggerModule.createDocument(app, config, documentOptions);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'api-json',
  });
  await app.listen(PORT);

  logger.log(`API running on ${BASE_URL}/api`);
  logger.log(`API docs: ${BASE_URL}/docs`);
  logger.log(`Health check: ${BASE_URL}/api/health`);
}

bootstrap();
