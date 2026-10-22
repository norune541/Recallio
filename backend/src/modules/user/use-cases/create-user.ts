import { Injectable } from '@nestjs/common';
import { UserDao } from '../user.dao.js';
import type { CreateUserInput } from '../dto/CreateUserInput.dto.js';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userDao: UserDao) {}

  async execute(input: CreateUserInput) {
    await this.userDao.createUser(input);
  }
}
