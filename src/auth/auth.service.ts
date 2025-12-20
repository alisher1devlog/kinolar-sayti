import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { MailService } from 'src/mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private jwtService: JwtService,
  ) {}
  async register(dto: RegisterDto) {
    try {
      const existingUser = await this.prisma.user.findFirst({
        where: { OR: [{ email: dto.email }, { user_name: dto.user_name }] },
      });

      if (existingUser) {
        throw new ConflictException('Bu username yoki email band!');
      }

      const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

      const hashPassword = await bcrypt.hash(dto.password, 10);

      const newUser = await this.prisma.user.create({
        data: {
          user_name: dto.user_name,
          email: dto.email,
          password_hash: hashPassword,
          role: 'USER',
          is_active: false,
          activation_token: activationCode,
        },
      });
      try {
        await this.mailService.sendUserConfirmation(
          newUser.email,
          activationCode,
        );
      } catch (error) {
        console.log(
          "Email jo'natishda xato bo'ldi, lekin user yaratildi.",
          error,
        );
      }
      return {
        success: true,
        message:
          "Ro'yxatdan o'tdingiz. Iltimos, emailga yuborilgan kodni tasdiqlang.",
        data: {
          id: newUser.id,
          user_name: newUser.user_name,
          email: newUser.email,
          role: newUser.role,
          created_at: newUser.created_at,
        },
      };
    } catch (error) {
      console.log(`Register Error`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Registerda xatolik');
    }
  }
  async verifyEmail(dto: VerifyEmailDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (!user) {
        throw new NotFoundException('Foydalanuvchi topilmadi');
      }
      if (user.is_active) {
        throw new BadRequestException('Bu akkaunt allaqachon faollashtirilgan');
      }
      if (!user.activation_token || user.activation_token !== dto.code) {
        throw new BadRequestException(
          "Tasdiqlash kodi noto'g'ri yoki eskirgan!",
        );
      }
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          is_active: true,
          activation_token: null, // Kodni ishlatib bo'ldik, o'chiramiz
        },
      });
      return {
        message:
          'Akkaunt muvaffaqiyatli faollashtirildi! Endi kirishingiz mumkin.',
        is_active: true,
      };
    } catch (error) {
      if (error.status === 404 || error.status === 400) {
        throw error;
      }
      console.log(`Verify Error`, error);
      throw new InternalServerErrorException(`Verify qilishda xatolik`);
    }
  }
  async login(dto: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) {
        throw new UnauthorizedException(`Email yoki parol natog'ri`);
      }
      const isPasswordValid = await bcrypt.compare(
        dto.password,
        user.password_hash,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException("Email yoki parol noto'g'ri!");
      }
      if (!user.is_active) {
        throw new UnauthorizedException(
          'Hisobingiz hali faollashtirilmagan. Iltimos, emailingizni tekshiring.',
        );
      }

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const token = await this.jwtService.signAsync(payload);

      return {
        success: true,
        message: 'Muvaffaqiyatli tizimga kirdingiz',
        token: token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Login qilishda xatolik!`);
    }
  }
}
