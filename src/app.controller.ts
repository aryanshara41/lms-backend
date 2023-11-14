import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { IORedisKey } from './redis/redis.constansts';
import Redis from 'ioredis/built/Redis';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { UserRole } from './user/user.schema';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Roles(UserRole.USER)
  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  async getHello(): Promise<string> {
    return 'user is not found in redis';
  }
}
