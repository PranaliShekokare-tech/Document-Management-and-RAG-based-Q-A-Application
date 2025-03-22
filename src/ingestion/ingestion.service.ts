import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { IngestionProcess } from './entities/ingestion.entity';


@Injectable()
export class IngestionService {
  constructor(
    @InjectRepository(IngestionProcess)
    private ingestionRepository: Repository<IngestionProcess>,
  ) {}

  async triggerIngestion(documentId: string, data: any) {
    const process = this.ingestionRepository.create({
      documentId,
      status: 'processing',
    });

    await this.ingestionRepository.save(process);

    try {
      const pythonBackendUrl = 'http://localhost:5000/ingest';
      const response = await axios.post(pythonBackendUrl, data);

      await this.ingestionRepository.update(process.id, {
        status: 'completed',
      });

      return {
        message: 'Ingestion triggered and completed',
        id: process.id,
        result: response.data,
      };
    } catch (error:any) {
      await this.ingestionRepository.update(process.id, {
        status: 'failed',
        errorMessage: error.message,
      });

      return {
        message: 'Failed to trigger ingestion',
        id: process.id,
        error: error.message,
      };
    }
  }

  async getIngestionStatus(id: string) {
    const ingestion = await this.ingestionRepository.findOne({ where: { id } });

    if (!ingestion) {
      throw new NotFoundException('Ingestion process not found');
    }

    return ingestion;
  }

  async retryIngestion(id: string) {
    const ingestion = await this.ingestionRepository.findOne({ where: { id } });

    if (!ingestion) {
      throw new NotFoundException('Ingestion process not found');
    }

    if (ingestion.status !== 'failed') {
      return { message: 'Ingestion is not in a failed state and cannot be retried' };
    }

    // Retrying with dummy data (can be improved by storing request payloads)
    return this.triggerIngestion(ingestion.documentId, { documentId: ingestion.documentId });
  }

  async getAllIngestions() {
    return this.ingestionRepository.find();
  }
}