import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  async create(doc: Partial<Document>): Promise<Document> {
    const newDoc = this.documentRepository.create(doc);
    return this.documentRepository.save(newDoc);
  }
  
  async findAll(): Promise<Document[]> {
    return this.documentRepository.find({ relations: ['owner'] });
  }

  async findOne(id: string): Promise<Document> {
    const document = await this.documentRepository.findOne({ where: { id }, relations: ['owner'] });
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return document;
  }

  async update(id: string, updateData: Partial<Document>): Promise<Document> {
    const document = await this.findOne(id);
    await this.documentRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<Document> {
    const document = await this.findOne(id);
    await this.documentRepository.remove(document);
    return document;
  }
}
