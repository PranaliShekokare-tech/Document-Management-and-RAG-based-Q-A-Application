import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Ingestion')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('trigger/:documentId')
  @Roles('admin', 'editor')
  trigger(@Param('documentId') documentId: string, @Body() body: any) {
    return this.ingestionService.triggerIngestion(documentId, body);
  }

  @Get('status/:id')
  @Roles('admin', 'editor')
  getStatus(@Param('id') id: string) {
    return this.ingestionService.getIngestionStatus(id);
  }

  @Post('retry/:id')
  @Roles('admin')
  retry(@Param('id') id: string) {
    return this.ingestionService.retryIngestion(id);
  }

  @Get('all')
  @Roles('admin')
  getAll() {
    return this.ingestionService.getAllIngestions();
  }
}
