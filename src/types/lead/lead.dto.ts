import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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
}
