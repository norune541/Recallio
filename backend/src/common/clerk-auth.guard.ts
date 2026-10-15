import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { clerkClient, getAuth } from '@clerk/express';
import type { Request } from 'express';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated) {
      throw new UnauthorizedException('Unathorized');
    }

    try {
      const user = await clerkClient.users.getUser(userId);
      req.user = user;
    } catch (err) {
      throw new UnauthorizedException('Failed to fetch user data');
    }

    return true;
  }
}
