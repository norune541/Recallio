import {
  Controller,
  Post,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { verifyWebhook } from '@clerk/express/webhooks';

import { CreateUserUseCase } from '../user/use-cases/create-user.js';
import { UserDao } from '../user/user.dao.js';
import type { Request } from 'express';

@ApiTags('clerk')
@Controller('webhooks/clerk')
export class ClerkController {
  private readonly logger = new Logger(ClerkController.name);

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

    this.logger.log(
      JSON.stringify({
        message: 'Clerk webhook received',
        clerkUserId: event.data.id,
        eventType: event.type,
        webhookId: req.headers['svix-id'],
      }),
    );

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

        this.logger.log(
          JSON.stringify({
            message: 'User created',
            clerkUserId: event.data.id,
            createdAt: event.data.created_at,
          }),
        );
        break;

      case 'user.deleted':
        if (event.data.id) {
          await this.userDao.deleteUser(event.data.id);

          this.logger.log(
            JSON.stringify({
              message: 'User deleted',
              clerkUserId: event.data.id,
              timestamp: event.timestamp,
            }),
          );
        }
        break;

      default:
        break;
    }
  }
}
