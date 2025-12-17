import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'alisher_dev',
    description: 'Foydalanuvchi taxallusi',
  })
  @IsString()
  @IsNotEmpty()
  user_name: string;

  @ApiProperty({ example: 'alisher@example.com', description: 'Email manzil' })
  @IsEmail({}, { message: `Email natog'ri formatda` })
  email: string;

  @ApiProperty({
    example: 'parol123',
    description: 'Kamida 8 xonali parol',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: `Parol kamida 8 ta belgidan iborat bo'lishi kerak` })
  password: string;
}
