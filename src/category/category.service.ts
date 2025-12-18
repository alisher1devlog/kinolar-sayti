import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  }

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const slug = this.generateSlug(createCategoryDto.name);

      const existing = await this.prisma.category.findUnique({
        where: { slug },
      });

      if (existing) {
        throw new ConflictException('Bunday katagoriya allaqochon mavjud!');
      }

      return this.prisma.category.create({
        data: {
          name: createCategoryDto.name,
          slug,
          description: createCategoryDto.description,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Catefory yaratishda xatolik');
    }
  }

  async findAll() {
    return await this.prisma.category.findMany();
  }

  async findOne(id: string) {
    // console.log(id)
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    // console.log(category)
    if (!category) throw new NotFoundException('Kategoriya mavjud emas!');

    return {
      success: true,
      message: 'Category topildi',
      data: category,
    };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
      });
      console.log(category)
      if (!category)
        throw new NotFoundException('Bunday category mavjud emas!');

      let slug = category.slug;
      if (updateCategoryDto.name) {
        slug = this.generateSlug(updateCategoryDto.name);

        // Yangi slug band emasligini tekshirish kerak (ixtiyoriy, lekin tavsiya qilinadi)
        const existingSlug = await this.prisma.category.findUnique({
          where: { slug },
        });
        if (existingSlug && existingSlug.id !== id) {
          throw new ConflictException(
            'Bu nomdagi kategoriya allaqachon mavjud',
          );
        }
      }

      return await this.prisma.category.update({
        where: { id },
        data: {
          ...updateCategoryDto,
          slug,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException("Catefory o'zgartirishda xatolik");
    }
  }

  async remove(id: string) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
      });
      if (!category)
        throw new NotFoundException('Bunday xategory mavjud emas!');

      await this.prisma.category.delete({
        where: { id },
      });

      return {
        success: true,
        message: "Kategoriya o'chirildi",
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Catefory o'chirishda xatolik");
    }
  }
}
