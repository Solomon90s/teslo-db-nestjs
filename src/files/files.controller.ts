import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileNamer, fileFilter } from './helpers';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files - Get and Upload')
@Controller('files')
export class FilesController {
  constructor(
    private readonly fileService: FilesService,
    private readonly configService: ConfigService
  ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() response: Response,
    @Param('imageName') imageName: string
  ){
    const path = this.fileService.getStaticProductImage(imageName);
    response.sendFile(path);
  }

  @Post('product')
  @UseInterceptors( FileInterceptor('file', {
    fileFilter: fileFilter, //* Se encarga de ejecutar la función que tenemos en el helper
    // limits: { fileSize: 1000}
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))

  uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
  ){
    if ( !file ) {
      throw new BadRequestException('Make sure that the file is an image');
    }
    const secureURL = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;
    return {
      secureURL
    };
  }
}
