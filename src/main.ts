import { NestFactory } from '@nestjs/core';
import { AppModule } from './apps/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Microserviço de Autenticação')
    .setDescription(
      'Microserviço de Autenticação usando: Nestjs, Swagger, MongoDB, Mongoose e DDD',
    )
    .setVersion('1.0')
    .build();

  app.enableCors();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.AUTH_PORT);
}
bootstrap();
