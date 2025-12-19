import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileService } from './file.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Files')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Fayl yuklash (Rasm yoki Video)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // 1. Hajmni tekshirish (Masalan: 50 MB gacha)
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }),
          // 2. Turni tekshirish (Rasm yoki Video)
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png|mp4)' }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    const fileName = await this.fileService.createFile(file);
    return {
      success: true,
      message: 'Fayl yuklandi',
      fileName,
    };
  }
}
