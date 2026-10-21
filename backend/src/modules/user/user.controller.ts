import {
  Controller,
  Get,
  Post,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { verifyWebhook } from '@clerk/express/webhooks';

import { UserResponseDto } from './dto/UserResponse.dto.js';
import { UserNotFoundDto } from './dto/UserNotFound.dto.js';
import { UserNotFoundException } from './dto/UserNotFound.dto.js';

import { ClerkAuthGuard } from 'backend/src/common/clerk-auth.guard.js';
import { CreateUserUseCase } from './use-cases/create-user.js';

import { UserDao } from './user.dao.js';
import type { Request } from 'express';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly userDao: UserDao,
  ) {}

  @Get()
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Get user from DB' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found', type: UserNotFoundDto })
  async getProfile(@Req() req: Request): Promise<UserResponseDto> {
    const user = await this.userDao.findUserByClerkId(req.user.id);
    if (!user) throw new UserNotFoundException();
    return user;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create user using clerk middleware' })
  @ApiCreatedResponse({ description: 'User created' })
  async signUp(@Req() req: Request) {
    const event = await verifyWebhook(req);
  }
}
