import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BotService } from './modules/bot/bot.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('🌐 Running with HTTP (WS enabled)');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('CRM Api Docs')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  const botService = app.get(BotService);
  botService.initBot();
  botService.launch();

  console.log(`✅ Server started on port ${port}`);
}

bootstrap();
