import { Body, Controller, Logger, Post } from '@nestjs/common';
import { LeadService } from './lead.service';
import { CreateLeadDto } from 'src/types/lead/lead.dto';

@Controller('lead')
export class LeadController {
  private readonly logger = new Logger(LeadController.name);
  constructor(private readonly leadService: LeadService) {}

  
  @Post()
  async createLead(@Body() createLeadDto: CreateLeadDto): Promise<void> {
    this.logger.log(`Creating lead: ${JSON.stringify(createLeadDto)}`);
    return this.leadService.createLead(createLeadDto);
  }
}
