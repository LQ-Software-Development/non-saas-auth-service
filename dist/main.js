"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./apps/app.module");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Microserviço de Autenticação')
        .setDescription('Microserviço de Autenticação usando: Nestjs, Swagger, MongoDB, Mongoose e DDD')
        .setVersion('1.0')
        .build();
    app.enableCors();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, document);
    await app.listen(process.env.AUTH_PORT);
}
bootstrap();
//# sourceMappingURL=main.js.map