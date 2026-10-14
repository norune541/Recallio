import {
  Controller,
  Get,
  Post,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from 'backend/src/common/clerk-auth.guard.js';
import { CreateUserUseCase } from './use-cases/create-user.js';
import type { Request } from 'express';

@Controller('users')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}
  @Get()
  @UseGuards(ClerkAuthGuard)
  getProfile(@Req() req: Request) {
    const user = req.user;
    console.log(JSON.stringify(user, null, 2));
    return user;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ClerkAuthGuard)
  async signUp(@Req() req: Request) {
    await this.createUserUseCase.execute(req.user);
  }
}
