import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { LogLevel } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

dotenv.config();

const LOG_LEVEL_HIERARCHY: LogLevel[] = ['verbose', 'debug', 'log', 'warn', 'error'];

function getLogLevels(): LogLevel[] {
  const envLevel = (process.env.LOG_LEVEL as LogLevel) || 'error';
  const index = LOG_LEVEL_HIERARCHY.indexOf(envLevel);
  if (index === -1) return ['error', 'warn', 'log'];
  return LOG_LEVEL_HIERARCHY.slice(index);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: getLogLevels(),
  });

  if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
    const redisHost = process.env.REDIS_HOST;
    const redisPort = parseInt(process.env.REDIS_PORT, 10);
    const redisPassword = process.env.REDIS_PASSWORD || undefined;

    console.log('Configurando microserviço Redis Pub/Sub...');
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.REDIS,
      options: {
        host: redisHost,
        port: redisPort,
        password: redisPassword || undefined,
        retryAttempts: 5,
        retryDelay: 3000,
      },
    });
    console.log(`Microserviço Redis conectado em ${redisHost}:${redisPort}`);
  }

  await app.startAllMicroservices();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Microserviço de Autenticação')
    .setDescription(
      'Microserviço de Autenticação usando: Nestjs, Swagger, MongoDB, Mongoose e DDD',
    )
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  app.enableCors();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css',
    ],
  });

  await app.listen(process.env.AUTH_PORT || 3000);
}

bootstrap().then(() => {
  console.log(
    `Api is running, see the documentation at http://localhost:${process.env.AUTH_PORT || 3000
    }/docs`,
  );
});
