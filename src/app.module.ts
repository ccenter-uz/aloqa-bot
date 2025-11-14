import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { appConfig, mongoDbConfig } from './common/config/configs';
import { MongooseModule } from '@nestjs/mongoose';
import { BotModule } from './modules/bot/bot.module';
import { LeadModule } from './modules/lead/lead.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    BotModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, mongoDbConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('db.url'),
      }),
      inject: [ConfigService],
    }),
    LeadModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
