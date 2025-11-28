import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST') ?? '127.0.0.1';
        const port = Number(configService.get<number>('REDIS_PORT') ?? 6379);
        const password = configService.get<string>('REDIS_PASSWORD');
        const db = configService.get<number>('REDIS_DB');
        const tls = configService.get<string>('REDIS_TLS');

        const options: RedisOptions = {
          host,
          port,
          password,
          db: typeof db === 'number' ? db : undefined,
          lazyConnect: false,
          enableReadyCheck: true,
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => Math.min(times * 50, 2000),
        };

        if (tls && tls.toLowerCase() === 'true') {
          options.tls = {};
        }

        return new Redis(options);
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
