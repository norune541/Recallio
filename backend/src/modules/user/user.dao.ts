import { Injectable } from '@nestjs/common';
import { PrismaService } from 'backend/src/prisma/prisma.service.js';

import type { CreateUserInput } from './dto/CreateUserInput.dto.js';
import type { UserDto } from './dto/UserResponse.dto.js';

@Injectable()
export class UserDao {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(input: CreateUserInput): Promise<UserDto> {
    return await this.prisma.user.upsert({
      where: {
        email: input.email,
      },
      update: {
        clerkUserId: input.id,
        firstName: input.firstName,
        lastName: input.lastName,
        username: input.username,
        imageUrl: input.imageUrl,
      },
      create: {
        email: input.email,
        clerkUserId: input.id,
        firstName: input.firstName,
        lastName: input.lastName,
        username: input.username,
        imageUrl: input.imageUrl,
      },
    });
  }

  async findUserByEmail(email: string): Promise<UserDto | null> {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        clerkUserId: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteUser(clerkUserId: string): Promise<void> {
    await this.prisma.user.deleteMany({
      where: {
        clerkUserId,
      },
    });
  }
}
