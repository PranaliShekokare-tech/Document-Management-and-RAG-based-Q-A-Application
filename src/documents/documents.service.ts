
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  create(doc: Partial<Document>) {
    return this.documentRepository.save(doc);
  }

  findAll() {
    return this.documentRepository.find({ relations: ['owner'] });
  }

  findOne(id: string) {
    return this.documentRepository.findOne({ where: { id }, relations: ['owner'] });
  }

  async update(id: string, updateData: Partial<Document>) {
    await this.documentRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string) {
    const doc = await this.findOne(id);
    if (!doc) throw new NotFoundException();
    return this.documentRepository.remove(doc);
  }
}
