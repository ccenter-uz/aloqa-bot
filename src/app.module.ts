import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { appConfig, mongoDbConfig } from './common/config/configs';
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
    
    LeadModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
