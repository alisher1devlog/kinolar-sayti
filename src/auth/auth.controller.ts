import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: `Ro'yhatdan o'tish uchun tasdiqlash kodi yuborildi`,
  })
  @ApiResponse({ status: 201, description: `Kod yuborildi` })
  async register(@Body() reisterDto: RegisterDto) {
    return this.authService.register(reisterDto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Emailni kod orqali tasdiqlash' })
  @ApiResponse({ status: 200, description: 'Akkaunt faollashdi.' })
  @ApiResponse({ status: 400, description: "Kod noto'g'ri." })
  async verify(@Body() verifyDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyDto);
  }
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: `Tizimga kirish va token olish` })
  @ApiResponse({ status: 200, description: `Token qaytarildi!` })
  @ApiResponse({ status: 401, description: `Login yoki parol xato` })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);
    res.cookie('auth_token', result.token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
      message: 'Muvaffaqiyatli kirildi',
      data: result,
    };
  }
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: `Tizimdan chiqish` })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('auth_token');

    return {
      success: true,
      message: 'Tizimdan muvaffaqiyatli chiqildi',
    };
  }
}
