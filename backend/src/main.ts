import { Logger, StandardSchemaValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerModule,
  type SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { createSchema } from 'zod-openapi';

import { AppModule } from './app.module.js';
import { env } from './config/env.js';

async function bootstrap() {
  const { PORT } = env;
  const BASE_URL = 'http://localhost';

  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

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
  SwaggerModule.setup('docs', app, document);

  await app.listen(PORT);

  logger.log(`API running on ${BASE_URL}:${PORT}`);
  logger.log(`API docs: ${BASE_URL}:${PORT}/docs`);
  logger.log(`Health check: ${BASE_URL}:${PORT}/health`);
}

bootstrap();
