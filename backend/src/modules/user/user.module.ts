import { Module } from '@nestjs/common';
import { UserController } from './user.controller.js';
import { UserDao } from './user.dao.js';
import { CreateUserUseCase } from './use-cases/create-user.js';

@Module({
  controllers: [UserController],
  providers: [UserDao, CreateUserUseCase],
})
export class UserModule {}
