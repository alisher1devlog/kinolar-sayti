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

  async findAll() {
    return await this.prisma.movie.findMany({
      include: {
        categories: { include: { category: true } },
        files: true,
      },
    });
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
