import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LeadTypeEnum } from './enums';

export class CreateLeadDto {
  @ApiProperty({
    description: 'Full name of the lead',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({
    description: 'Phone number of the lead',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Type of the lead',
    required: false,
    enum: LeadTypeEnum,
  })
  @IsEnum(LeadTypeEnum)
  @IsOptional()
  type?: LeadTypeEnum;

  @ApiProperty({
    description: 'Additional notes about the lead',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Question of the lead',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  question?: string;
}
