import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Aliyev Valijon', description: "To'liq ism" })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiProperty({ example: '+998901234567', description: 'Telefon raqam' })
  @IsOptional()
  @IsString()
  @IsPhoneNumber('UZ')
  phone?: string;

  @ApiProperty({ example: 'Uzbekistan', description: 'Davlat' })
  @IsOptional()
  @IsString()
  country?: string;
}
