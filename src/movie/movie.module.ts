import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FileModule } from 'src/file/file.module';

@Module({
  imports: [PrismaModule, FileModule],
  controllers: [MovieController],
  providers: [MovieService],
})
export class MovieModule {}
