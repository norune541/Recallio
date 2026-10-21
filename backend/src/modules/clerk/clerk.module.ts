import { Module } from '@nestjs/common';

import { ClerkController } from './clerk.controller.js';
import { UserDao } from '../user/user.dao.js';
import { CreateUserUseCase } from '../user/use-cases/create-user.js';

@Module({
  controllers: [ClerkController],
  providers: [UserDao, CreateUserUseCase],
})
export class ClerkModule {}
