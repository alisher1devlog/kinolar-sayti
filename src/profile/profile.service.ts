import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });
      console.log(userId);
      if (!user) throw new NotFoundException(`Foydalanuvchi topilmadi`);
      return {
        success: true,
        data: {
          user_id: user.id,
          full_name: user.profile?.full_name || null,
          phone: user.profile?.phone || null,
          country: user.profile?.country || null,
          created_at: user.created_at,
          avatar_url: user.avatar_url,
        },
      };
    } catch (error) {
      console.log(error);
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updatedProfile = await this.prisma.profile.upsert({
      where: { user_id: userId },
      update: {
        full_name: dto.full_name,
        phone: dto.phone,
        country: dto.country,
      },
      create: {
        user_id: userId,
        full_name: dto.full_name,
        phone: dto.phone,
        country: dto.country,
      },
    });
    return {
      success: true,
      message: 'Profil muvaffaqiyatli yangilandi',
      data: {
        user_id: userId,
        full_name: updatedProfile.full_name,
        phone: updatedProfile.phone,
        country: updatedProfile.country,
        updated_at: updatedProfile.updated_at,
      },
    };
  }
}
