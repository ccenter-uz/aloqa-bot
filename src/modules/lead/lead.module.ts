import { Module } from '@nestjs/common';
import { LeadService } from './lead.service';
import { LeadController } from './lead.controller';
import { BotModule } from 'src/modules/bot/bot.module';

@Module({
  imports: [BotModule],
  controllers: [LeadController],
  providers: [LeadService],
})
export class LeadModule {}
