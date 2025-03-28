
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }
  findByUsername(username: string) {
    return this.usersRepository.findOne({ where: { username } });
  }
  
  create(user: any): Promise<User> {
    return this.usersRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async updateRole(id: string, role: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
  
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  
    user.role = role;
    return this.usersRepository.save(user);
  }
  

  delete(id: string) {
    return this.usersRepository.delete(id);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
  
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  
    return user;
  }
  
}
