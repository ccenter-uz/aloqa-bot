import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';

export type RateLimitResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      reason: string;
    };

type RateWindow = {
  key: string;
  ttlSeconds: number;
  maxRequests: number;
  violationMessage: string;
};

@Injectable()
export class RateLimitService {
  private static readonly TWO_SECONDS = 2;
  private static readonly ONE_HOUR = 60 * 60;
  private static readonly SHORT_WINDOW_LIMIT = 1;
  private static readonly LONG_WINDOW_LIMIT = 10;

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async checkByIp(ip: string): Promise<RateLimitResult> {
    const sanitizedIp = ip || 'unknown';
    const windows: RateWindow[] = [
      {
        key: `rate:ip:${sanitizedIp}:2s`,
        ttlSeconds: RateLimitService.TWO_SECONDS,
        maxRequests: RateLimitService.SHORT_WINDOW_LIMIT,
        violationMessage: 'Too many requests from this IP (limit: 1 req / 2s).',
      },
      {
        key: `rate:ip:${sanitizedIp}:1h`,
        ttlSeconds: RateLimitService.ONE_HOUR,
        maxRequests: RateLimitService.LONG_WINDOW_LIMIT,
        violationMessage:
          'Too many requests from this IP (limit: 10 req / hour).',
      },
    ];

    return this.evaluateWindows(windows);
  }

  async checkByUserId(userId: string | number): Promise<RateLimitResult> {
    const normalizedUserId = String(userId);
    const windows: RateWindow[] = [
      {
        key: `rate:user:${normalizedUserId}:2s`,
        ttlSeconds: RateLimitService.TWO_SECONDS,
        maxRequests: RateLimitService.SHORT_WINDOW_LIMIT,
        violationMessage:
          'Too many requests from this user (limit: 1 req / 2s).',
      },
      {
        key: `rate:user:${normalizedUserId}:1h`,
        ttlSeconds: RateLimitService.ONE_HOUR,
        maxRequests: RateLimitService.LONG_WINDOW_LIMIT,
        violationMessage:
          'Too many requests from this user (limit: 10 req / hour).',
      },
    ];

    return this.evaluateWindows(windows);
  }

  private async evaluateWindows(
    windows: RateWindow[],
  ): Promise<RateLimitResult> {
    for (const window of windows) {
      const result = await this.hitWindow(window);
      if (!result.ok) {
        return result;
      }
    }

    return { ok: true };
  }

  private async hitWindow(window: RateWindow): Promise<RateLimitResult> {
    const count = await this.increment(window.key, window.ttlSeconds);
    if (count > window.maxRequests) {
      return {
        ok: false,
        reason: window.violationMessage,
      };
    }

    return { ok: true };
  }

  private async increment(key: string, ttlSeconds: number): Promise<number> {
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, ttlSeconds);
      return count;
    }

    const ttl = await this.redis.ttl(key);
    if (ttl < 0) {
      await this.redis.expire(key, ttlSeconds);
    }

    return count;
  }
}
