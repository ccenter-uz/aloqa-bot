import { Module } from '@nestjs/common';
import { LeadService } from './lead.service';
import { LeadController } from './lead.controller';
import { BotModule } from 'src/modules/bot/bot.module';
import { RateLimitModule } from 'src/common/rate-limit/rate-limit.module';

@Module({
  imports: [BotModule, RateLimitModule],
  controllers: [LeadController],
  providers: [LeadService],
})
export class LeadModule {}
