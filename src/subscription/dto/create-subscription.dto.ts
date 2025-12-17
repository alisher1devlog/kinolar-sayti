import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'plan_uuid_here', description: 'Plan Id si' })
  @IsUUID()
  @IsNotEmpty()
  plan_id: string;

  @ApiProperty({ example: 'card', description: `To'lov turi` })
  @IsString()
  @IsNotEmpty()
  payment_method: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  auto_renew: boolean;

  @ApiProperty({
    example: {
      card_number: '8600...',
      expiry: '09/28',
      card_holder: 'ALIYEV A',
    },
  })
  @IsObject()
  payment_details: any;
}
