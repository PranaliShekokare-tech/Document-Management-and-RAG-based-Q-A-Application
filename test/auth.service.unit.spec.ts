import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConflictException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: { findByEmail: jest.Mock; create: jest.Mock };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should throw ConflictException if email already exists', async () => {
      const userDto = { email: 'test@example.com', password: 'Password123' };

      usersService.findByEmail.mockResolvedValue(userDto);

      await expect(authService.register(userDto)).rejects.toThrow(ConflictException);
      expect(usersService.findByEmail).toHaveBeenCalledWith(userDto.email);
    });

    it('should hash password and create user if email is unique', async () => {
      const userDto = { email: 'test@example.com', password: 'Password123', username: 'testuser' };
      const hashedPassword = 'hashedPass';

      usersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const createdUser = { id: 1, ...userDto, password: hashedPassword, role: 'user' };
      usersService.create.mockResolvedValue(createdUser);

      const result = await authService.register(userDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(userDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(userDto.password, 10);
      expect(usersService.create).toHaveBeenCalledWith({
        ...userDto,
        password: hashedPassword,
        role: 'user',
      });

      expect(result).toEqual(createdUser);
    });
  });

  describe('login', () => {
    it('should return access_token for valid user', async () => {
      const user = { id: 1, username: 'testuser', role: 'user' };
      jwtService.sign.mockReturnValue('signed-jwt-token');

      const result = await authService.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith({
        username: user.username,
        sub: user.id,
        role: user.role,
      });
      expect(result).toEqual({
        access_token: 'signed-jwt-token',
      });
    });
  });

  describe('validateUser', () => {
    it('should return user data without password if credentials are valid', async () => {
      const user = { id: 1, email: 'test@example.com', password: 'hashedPass', username: 'testuser' };
      usersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser('test@example.com', 'Password123');

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
      });
    });

    it('should return null if user is not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await authService.validateUser('wrong@example.com', 'Password123');

      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      const user = { id: 1, email: 'test@example.com', password: 'hashedPass', username: 'testuser' };
      usersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.validateUser('test@example.com', 'WrongPassword');

      expect(result).toBeNull();
    });
  });
});
