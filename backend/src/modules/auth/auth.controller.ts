import { Controller, Get, Req } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from 'backend/src/common/clerk-auth.guard.js';
import type { Request } from 'express';

@Controller()
export class AuthController {
  @Get('me')
  @UseGuards(ClerkAuthGuard)
  getProfile(@Req() req: Request) {
    const user = req.user;
    console.log(JSON.stringify(user, null, 2));
    return user;
  }
}
