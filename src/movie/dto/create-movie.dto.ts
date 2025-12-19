import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionType } from '@prisma/client';

export class CreateMovieDto {
  @ApiProperty({ example: 'O‘rgimchak Odam', description: 'Kino nomi' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Juda qiziq kino...', description: 'Kino haqida' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 2024, description: 'Chiqarilgan yili' })
  @Type(() => Number)
  @IsNumber()
  release_year: number;

  @ApiProperty({ example: 120, description: 'Davomiyligi (minut)' })
  @Type(() => Number)
  @IsNumber()
  duration_minutes?: number;

  @ApiProperty({ example: 'FREE', enum: SubscriptionType })
  @IsEnum(SubscriptionType)
  subscription_type: SubscriptionType;

  @ApiProperty({
    example: 'cat_id_1,cat_id_2',
    description: 'Kategoriya ID lari (vergul bilan)',
  })
  @IsString()
  category_id: string;
}
