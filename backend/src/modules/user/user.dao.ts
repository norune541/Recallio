import { Injectable } from '@nestjs/common';
import { PrismaService } from 'backend/src/prisma/prisma.service.js';

import type { CreateUserInput } from './dto/CreateUserInput.js';
import type { User } from 'backend/src/generated/prisma/client.js';

@Injectable()
export class UserDao {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(input: CreateUserInput): Promise<User> {
    return this.prisma.user.create({
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

  async findUserByClerkId(id: string): Promise<User | null> {
    const user = this.prisma.user.findUnique({
      where: {
        clerkUserId: id,
      },
    });
    if (!user) {
      return null;
    }

    return user;
  }
}
