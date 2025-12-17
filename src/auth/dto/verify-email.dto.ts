import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ example: 'client@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '1234', description: '4 xonali tasdiqlash kodi' })
  @IsString()
  @Length(4, 4, { message: "Kod faqat 4 ta raqamdan iborat bo'lishi kerak" })
  code: string;
}
