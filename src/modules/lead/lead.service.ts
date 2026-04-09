import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BotService } from 'src/modules/bot/bot.service';
import { CreateLeadDto } from 'src/types/lead/lead.dto';
import { leadFormatter } from 'src/common/helpers/lead-formatter';

@Injectable()
export class LeadService {
  private readonly logger = new Logger(LeadService.name);
  constructor(private readonly botService: BotService) {}

  async createLead(createLeadDto: CreateLeadDto) {
    this.logger.log(`Creating lead: ${JSON.stringify(createLeadDto)}`);
    try {
      if (createLeadDto.question && createLeadDto.title && createLeadDto.type) {
        throw new BadRequestException(
          'You can ask question only without title and type',
        );
      }
      await this.botService.sendToTarget(
        leadFormatter(
          createLeadDto.full_name,
          createLeadDto.phone,
          createLeadDto.type,
          createLeadDto.title,
          createLeadDto.question,
        ),
      );

      try {
        await fetch(
          'https://script.google.com/macros/s/AKfycbxRVAv8yvuNHUJHBT8uhlA2cXDnYKa8L3CCWvM8nWUW3Z1k9YPlyDLyo2zSPzVUV7yz/exec',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(createLeadDto),
          },
        );
        this.logger.log('Lead successfully sent to Google Sheets');
      } catch (sheetError) {
        this.logger.error(
          `Failed to send lead to Google Sheets: ${sheetError}`,
        );
      }
      
    } catch (error) {
      this.logger.error(`Failed to create lead: ${error}`);
      throw error;
    }
  }
}
