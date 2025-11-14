import { forwardRef, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BotService } from './bot.service';
import { ChatModule } from '../chat/chat.module';

@Global()
@Module({
  imports: [ConfigModule, forwardRef(() => ChatModule)],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
