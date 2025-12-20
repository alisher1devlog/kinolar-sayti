import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Query,
  Search,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@ApiTags('Movies')
@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Kino yaratish (Poster va Video bilan)' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'poster', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        release_year: { type: 'number' },
        duration_minutes: { type: 'number' },
        subscription_type: { type: 'string', enum: ['FREE', 'PREMIUM'] },
        category_id: {
          type: 'string',
          description: 'Vergul bilan ajratilgan IDlar',
        },

        poster: {
          type: 'string',
          format: 'binary',
        },
        video: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  create(
    @Body() createMovieDto: CreateMovieDto,
    @UploadedFiles()
    files: { poster?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    return this.movieService.create(createMovieDto, files);
  }

  @Get()
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Sahifa raqami',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Nechta kino chiqishi',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: "Kino nomi yoki tavsifi bo'yicha qidiruv",
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: "Kategoriya IDsi bo'yicha filtr",
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['asc', 'desc'],
    example: 'desc',
    description: 'Saralash (yangi/eski)',
  })
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Query('cateforyId') categoryId: string,
    @Query('sort') sort: 'asc' | 'desc',
  ) {
    return this.movieService.findAll({ page, limit, search, categoryId, sort });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movieService.findOne(id);
  }
}
