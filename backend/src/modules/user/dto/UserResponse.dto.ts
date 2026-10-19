import { ApiProperty } from '@nestjs/swagger';
import type { User } from 'backend/src/generated/prisma/client.js';

export type UserDto = Pick<
  User,
  | 'clerkUserId'
  | 'firstName'
  | 'lastName'
  | 'username'
  | 'email'
  | 'createdAt'
  | 'updatedAt'
>;

export class UserResponseDto implements UserDto {
  @ApiProperty({ description: 'Clerk user id', example: 'user_2abc123' })
  clerkUserId!: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  firstName!: string | null;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  lastName!: string | null;

  @ApiProperty({ description: 'Username', example: 'john_doe' })
  username!: string | null;

  @ApiProperty({
    description: 'Email adresses of the user',
    example: ['johndoe@example.com'],
  })
  email!: string[];

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-20T12:00:00Z',
  })
  updatedAt!: Date;
}
