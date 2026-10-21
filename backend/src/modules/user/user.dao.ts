import { Injectable } from '@nestjs/common';
import { PrismaService } from 'backend/src/prisma/prisma.service.js';

import type { CreateUserInput } from './dto/CreateUserInput.dto.js';
import type { UserDto } from './dto/UserResponse.dto.js';

@Injectable()
export class UserDao {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(input: CreateUserInput): Promise<UserDto> {
    return await this.prisma.user.create({
      data: {
        clerkUserId: input.id,
        firstName: input.firstName,
        lastName: input.lastName,
        username: input.username,
        email: input.emailAddresses.map((item) => item.emailAddress),
        imageUrl: input.imageUrl,
      },
    });
  }

  async findUserByEmail(email: string): Promise<UserDto | null> {
    return await this.prisma.user.findUnique({
      where: {
        email: [email],
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
}
