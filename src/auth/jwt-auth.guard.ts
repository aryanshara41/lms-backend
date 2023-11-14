import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/redis/redis.service';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { UserDocument } from 'src/user/user.schema';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private redisService: RedisService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const access_token = request.cookies['access_token'];
    // console.log(request.cookies);

    // console.log('access', access_token);

    if (!access_token) {
      throw new HttpException('You are not logged in', HttpStatus.UNAUTHORIZED);
    }

    try {
      const decoded = await this.jwtService.verifyAsync(access_token, {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      });

      const user = await this.redisService.getKey(decoded.id);

      if (!user) {
        throw new HttpException('Invalid user', HttpStatus.UNAUTHORIZED);
      }

      request['user'] = JSON.parse(user) as UserDocument;

      return true;
    } catch (error) {
      // console.log(error);
      throw new HttpException(error, HttpStatus.BAD_GATEWAY);
    }
  }
}
