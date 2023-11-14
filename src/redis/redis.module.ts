import { Global, Module } from '@nestjs/common';
import { IORedisKey } from './redis.constansts';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { ModuleRef } from '@nestjs/core';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: IORedisKey,
      useFactory: async (configService: ConfigService) => {
        return new Redis(configService.get<string>('REDIS_URL'));
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: [IORedisKey, RedisService],
})
export class RedisModule {
  constructor(private moduleRef: ModuleRef) {}
  async onApplicationShutdown(signal?: string): Promise<void> {
    return new Promise<void>((resolve) => {
      const redis = this.moduleRef.get(IORedisKey);
      redis.quit();
      redis.on('end', () => {
        resolve();
      });
    });
  }
}
