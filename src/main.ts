import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BotService } from './modules/bot/bot.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { RateLimitGuard } from './common/rate-limit/rate-limit.guard';

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

  if ((process.env.RATE_LIMIT_GLOBAL ?? 'false').toLowerCase() === 'true') {
    const rateLimitGuard = app.get(RateLimitGuard);
    app.useGlobalGuards(rateLimitGuard);
  }

  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  const botService = app.get(BotService);
  await botService.initBot();
  await botService.launch();

  console.log(`✅ Server started on port ${port}`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to bootstrap application', error);
  process.exit(1);
});
