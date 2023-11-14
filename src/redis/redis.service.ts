import { Injectable, Inject } from '@nestjs/common';
import { IORedisKey } from './redis.constansts';
import { Redis } from 'ioredis';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class RedisService {
  constructor(@Inject(IORedisKey) private redis: Redis) {}

  async setKey(key: string, value: any): Promise<void> {
    await this.redis.set(key, JSON.stringify(value));
  }

  async getKey(key: string): Promise<string> {
    return await this.redis.get(key);
  }

  async deleteKey(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
