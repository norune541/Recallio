import { ConflictException, Injectable } from '@nestjs/common';
import { UserDao } from '../user.dao.js';
import type { CreateUserInput } from '../dto/CreateUserInput.dto.js';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userDao: UserDao) {}

  async execute(input: CreateUserInput) {
    const existingUser = await this.userDao.findUserByClerkId(input.id);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    await this.userDao.createUser(input);
  }
}
