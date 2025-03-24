import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../src/users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateRoleDto } from 'src/users/update-dto.ts/update-role.dto';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  const mockUsers = [
    { id: '1', username: 'admin', role: 'admin' },
    { id: '2', username: 'editor', role: 'editor' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      (repo.find as jest.Mock).mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const userId = '1';
      (repo.findOne as jest.Mock).mockResolvedValue(mockUsers[0]);

      const user = await service.findOne(userId);

      expect(user).toEqual(mockUsers[0]);
    });
  });

  describe('updateRole', () => {
    it('should update user role', async () => {
      const userId = '2';
      const dto: UpdateRoleDto = { role: 'admin' };

      (repo.findOne as jest.Mock).mockResolvedValue(mockUsers[1]);
      (repo.save as jest.Mock).mockResolvedValue({
        ...mockUsers[1],
        role: dto.role,
      });

      const updatedUser = await service.updateRole(userId, dto.role);

      expect(updatedUser.role).toEqual('admin');
    });
  });

  describe('delete', () => {
    it('should delete a user by id', async () => {
      const userId = 'some-id';

      (repo.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      const result = await service.delete(userId);

      expect(repo.delete).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ affected: 1 });
    });
  });
});
