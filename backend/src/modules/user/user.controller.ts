import { Controller, Post, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { verifyWebhook } from '@clerk/express/webhooks';

import { CreateUserUseCase } from './use-cases/create-user.js';

import type { Request } from 'express';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create user using clerk webhooks' })
  @ApiCreatedResponse({ description: 'User created' })
  async signUp(@Req() req: Request) {
    const event = await verifyWebhook(req);

    if (event.type === 'user.created') {
      await this.createUserUseCase.execute({
        id: event.data.id,
        firstName: event.data.first_name,
        lastName: event.data.last_name,
        username: event.data.username,
        imageUrl: event.data.image_url,
        emailAddresses: event.data.email_addresses.map((e) => ({
          emailAddress: e.email_address,
        })),
      });
    }
  }
}
