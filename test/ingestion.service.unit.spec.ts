import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { IngestionProcess } from 'src/ingestion/entities/ingestion.entity';
import { IngestionService } from 'src/ingestion/ingestion.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('IngestionService', () => {
  let service: IngestionService;
  let repo: Repository<IngestionProcess>;

  const ingestionArray = [
    { id: '1', documentId: 'doc1', status: 'completed' },
    { id: '2', documentId: 'doc2', status: 'failed' },
  ];
 
  const mockRepo = {
    create: jest.fn().mockImplementation(dto => ({
      id: 'mock-id',  // Provide a mocked ID
      ...dto,
    })),
    save: jest.fn().mockResolvedValue({ id: 'mock-id' }),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    findOne: jest.fn().mockImplementation(({ where: { id } }) => {
      return ingestionArray.find(item => item.id === id);
    }),
    find: jest.fn().mockResolvedValue(ingestionArray),
  };
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        {
          provide: getRepositoryToken(IngestionProcess),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
    repo = module.get<Repository<IngestionProcess>>(getRepositoryToken(IngestionProcess));
  });

  afterEach(() => jest.clearAllMocks());

  describe('triggerIngestion', () => {
    it('should complete ingestion successfully', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: 'success' });

      const result = await service.triggerIngestion('doc1', { foo: 'bar' });

      expect(repo.create).toHaveBeenCalledWith({ documentId: 'doc1', status: 'processing' });
      expect(repo.save).toHaveBeenCalled();
      expect(repo.update).toHaveBeenCalledWith(expect.anything(), { status: 'completed' });

      expect(result).toEqual(expect.objectContaining({
        message: 'Ingestion triggered and completed',
      }));
    });

    it('should handle ingestion failure', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Failure'));

      const result = await service.triggerIngestion('doc1', { foo: 'bar' });

      expect(repo.update).toHaveBeenCalledWith(expect.anything(), {
        status: 'failed',
        errorMessage: 'Failure',
      });

      expect(result.message).toBe('Failed to trigger ingestion');
    });
  });

  describe('getIngestionStatus', () => {
    it('should return ingestion status', async () => {
      const result = await service.getIngestionStatus('1');

      expect(result).toEqual(ingestionArray[0]);
    });

    it('should throw NotFoundException if ingestion not found', async () => {
      await expect(service.getIngestionStatus('non-existent')).rejects.toThrow('Ingestion process not found');
    });
  });

  describe('retryIngestion', () => {
    it('should retry a failed ingestion', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: 'retried' });

      const result = await service.retryIngestion('2');

      expect(result.message).toBe('Ingestion triggered and completed');
    });

    it('should return message if ingestion not failed', async () => {
      const result = await service.retryIngestion('1');

      expect(result.message).toBe('Ingestion is not in a failed state and cannot be retried');
    });

    it('should throw NotFoundException if ingestion not found', async () => {
      await expect(service.retryIngestion('non-existent')).rejects.toThrow('Ingestion process not found');
    });
  });

  describe('getAllIngestions', () => {
    it('should return all ingestion processes', async () => {
      const result = await service.getAllIngestions();

      expect(result).toEqual(ingestionArray);
    });
  });
});
