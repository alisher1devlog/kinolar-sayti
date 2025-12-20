import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { Quality } from '@prisma/client';
import { title } from 'process';
import { contains } from 'class-validator';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MovieService {
  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
  ) {}

  async create(
    createMovieDto: CreateMovieDto,
    files: { poster?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    const posterFile = files.poster?.[0];
    const videoFile = files.video?.[0];

    if (!posterFile || !videoFile) {
      throw new BadRequestException('Poster va Video fayli yuklanishi shart!');
    }

    const posterUrl = await this.fileService.createFile(posterFile);
    const videoUrl = await this.fileService.createFile(videoFile);

    if (!posterUrl || !videoUrl) {
      throw new InternalServerErrorException(
        `Fayllarni saqlashda xatolik yuz berdi!`,
      );
    }

    const categoryIds = createMovieDto.category_id
      ? createMovieDto.category_id.split(',').map((id) => id.trim())
      : [];

    return this.prisma.$transaction(async (prisma) => {
      const movie = await prisma.movie.create({
        data: {
          title: createMovieDto.title,
          description: createMovieDto.description,
          release_year: createMovieDto.release_year,
          duration_minutes: createMovieDto.duration_minutes,
          subscription_type: createMovieDto.subscription_type,
          poster_url: posterUrl,
          slug:
            createMovieDto.title.toLowerCase().replace(/ /g, '-') +
            '-' +
            Date.now(),
        },
      });

      if (categoryIds.length > 0) {
        for (const catId of categoryIds) {
          await prisma.movieCategory.create({
            data: {
              movie_id: movie.id,
              category_id: catId,
            },
          });
        }
      }

      await prisma.movieFile.create({
        data: {
          movie_id: movie.id,
          file_url: videoUrl,
          quality: Quality.P720,
          language: 'uz',
        },
      });

      return {
        success: true,
        message: `Kino yaratildi`,
        data: movie,
      };
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    sort?: 'asc' | 'desc';
  }) {
    const { page = 1, limit = 10, search, categoryId, sort = 'desc' } = query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) {
      where.categories = {
        some: {
          category_id: categoryId,
        },
      };
    }

    const [movies, total] = await Promise.all([
      this.prisma.movie.findMany({
        where,
        take: Number(limit),
        skip,
        orderBy: {
          created_at: sort,
        },
        include: {
          categories: {
            select: {
              category: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
          files: {
            select: { file_url: true, quality: true },
          },
        },
      }),
      this.prisma.movie.count({ where }),
    ]);
    return {
      success: true,
      data: movies,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        pageCount: Math.ceil(total / Number(limit)),
      },
    };
  }

  async findOne(id: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        files: true,
      },
    });
    if (!movie) throw new NotFoundException('Kino topilmadi');
    return {
      success: true,
      message: `Kino keldi`,
      data: movie,
    };
  }
}
