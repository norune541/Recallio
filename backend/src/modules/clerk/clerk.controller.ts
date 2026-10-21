import { Controller, Post, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { verifyWebhook } from '@clerk/express/webhooks';

import { CreateUserUseCase } from '../user/use-cases/create-user.js';
import { UserDao } from '../user/user.dao.js';
import type { Request } from 'express';

@ApiTags('clerk')
@Controller('webhooks/clerk')
export class ClerkController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly userDao: UserDao,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Clerk webhooks' })
  @ApiOkResponse({ description: 'Webhook processed successfully' })
  async handleWebhook(@Req() req: Request) {
    const event = await verifyWebhook(req);
    switch (event.type) {
      case 'user.created':
        await this.createUserUseCase.execute({
          id: event.data.id,
          firstName: event.data.first_name,
          lastName: event.data.last_name,
          username: event.data.username,
          imageUrl: event.data.image_url,
          email: event.data.email_addresses[0].email_address,
        });
        break;

      case 'user.deleted':
        if (event.data.id) {
          await this.userDao.deleteUser(event.data.id);
        }
        break;

      default:
        break;
    }
  }
}
