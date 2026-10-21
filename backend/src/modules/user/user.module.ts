import { Module } from '@nestjs/common';
import { UserDao } from './user.dao.js';
import { CreateUserUseCase } from './use-cases/create-user.js';

@Module({
  providers: [UserDao, CreateUserUseCase],
  exports: [UserDao, CreateUserUseCase],
})
export class UserModule {}
