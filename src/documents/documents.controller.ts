import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('documents')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @Roles('admin', 'editor')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req: any, file: Express.Multer.File, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        title: { type: 'string' },
        description: { type: 'string' },
      },
    },
  })
  @HttpCode(201)
  create(@UploadedFile() file: Express.Multer.File, @Body() body: any, @Request() req: any) {
    const document:any = {
      title: body.title,
      description: body.description,
      filePath: file.path,
      owner: { id: req.user.userId }, // Assuming user info is added to the request by JwtAuthGuard
    };
    return this.documentsService.create(document);
  }

  @Get()
  findAll() {
    return this.documentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'editor')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.documentsService.update(id, updateData);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
     this.documentsService.remove(id);
     return {id};
  }
}
