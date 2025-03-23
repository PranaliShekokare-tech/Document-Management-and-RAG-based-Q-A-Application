import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from '../src/documents/documents.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Document } from '../src/documents/entities/document.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let repository: Repository<Document>;

  const mockDocument = {
    id: 'uuid-1',
    title: 'Test Document',
    description: 'Test Description',
    filePath: '/uploads/testfile.txt',
    owner: {},
  } as Document;

  const documentsArray = [
    { ...mockDocument },
    { ...mockDocument, id: 'uuid-2', title: 'Another Doc' },
  ];

  const mockRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockResolvedValue(mockDocument),
    find: jest.fn().mockResolvedValue(documentsArray),
    findOne: jest.fn().mockResolvedValue(mockDocument),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    remove: jest.fn().mockResolvedValue(mockDocument),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: getRepositoryToken(Document),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    repository = module.get<Repository<Document>>(getRepositoryToken(Document));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully insert a document', async () => {
      const dto:any = {
        title: 'Test Document',
        description: 'Test Description',
        filePath: '/uploads/testfile.txt',
        owner: {},
      };

      const result = await service.create(dto);
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockDocument);
    });
  });

  describe('findAll', () => {
    it('should return an array of documents', async () => {
      const result = await service.findAll();
      expect(result).toEqual(documentsArray);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a document', async () => {
      const result = await service.findOne('uuid-1');
      expect(result).toEqual(mockDocument);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-1' }, relations: ['owner'] });
    });

    it('should throw NotFoundException when document not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the document', async () => {
      const updatedDoc = { ...mockDocument, title: 'Updated Title' };
      jest.spyOn(service, 'findOne').mockResolvedValue(updatedDoc);

      const result = await service.update('uuid-1', { title: 'Updated Title' });
      expect(repository.update).toHaveBeenCalledWith('uuid-1', { title: 'Updated Title' });
      expect(result.title).toEqual('Updated Title');
    });
  });

  describe('remove', () => {
    it('should delete a document', async () => {
      const result = await service.remove('uuid-1');
      expect(repository.remove).toHaveBeenCalledWith(mockDocument);
      expect(result).toEqual(mockDocument);
    });
  });
});
