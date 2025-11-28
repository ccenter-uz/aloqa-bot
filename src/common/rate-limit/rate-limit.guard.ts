import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { RateLimitService } from './rate-limit.service';

type RequestWithUser = Request & {
  user?: {
    id?: string | number;
    userId?: string | number;
  };
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(private readonly rateLimitService: RateLimitService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const userId = this.extractUserId(request);
    if (userId) {
      const userResult = await this.rateLimitService.checkByUserId(userId);
      if (!userResult.ok) {
        this.logger.warn(`User rate limit exceeded: ${userId}`);
        throw new HttpException(
          { message: userResult.reason },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    const ip = this.extractIp(request);
    const ipResult = await this.rateLimitService.checkByIp(ip);
    if (!ipResult.ok) {
      this.logger.warn(`IP rate limit exceeded: ${ip}`);
      throw new HttpException(
        { message: ipResult.reason },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private extractUserId(request: RequestWithUser): string | undefined {
    const identifier = request.user?.id ?? request.user?.userId;

    if (identifier === undefined || identifier === null) {
      return undefined;
    }

    return String(identifier);
  }

  private extractIp(request: Request): string {
    const xForwardedFor = request.headers['x-forwarded-for'];

    if (typeof xForwardedFor === 'string' && xForwardedFor.length > 0) {
      return xForwardedFor.split(',')[0].trim();
    }

    if (Array.isArray(xForwardedFor) && xForwardedFor.length > 0) {
      return xForwardedFor[0];
    }

    return request.ip || request.socket?.remoteAddress || 'unknown';
  }
}
