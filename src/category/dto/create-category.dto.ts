import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Jangari', description: 'Kategoriya nomi' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Jangari va to‘polon kinolar',
    description: 'Tavsif',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
