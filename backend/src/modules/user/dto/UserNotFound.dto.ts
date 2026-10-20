import { NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class UserNotFoundException extends NotFoundException {
  constructor() {
    super({
      statusCode: 404,
      code: 'USER_NOT_FOUND',
      message: 'User not found',
      error: 'Not Found',
    } satisfies UserNotFoundDto);
  }
}

export class UserNotFoundDto {
  @ApiProperty({ description: 'HTTP status code', example: 404, enum: [404] })
  statusCode!: 404;

  @ApiProperty({
    description: 'Machine-readable error code',
    example: 'USER_NOT_FOUND',
    enum: ['USER_NOT_FOUND'],
  })
  code!: 'USER_NOT_FOUND';

  @ApiProperty({
    description: 'Human-readable error code',
    example: 'User not found',
  })
  message!: 'User not found';

  @ApiProperty({ description: 'HTTP status text', example: 'Not Found' })
  error!: 'Not Found';
}
