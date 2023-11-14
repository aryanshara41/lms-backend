import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Res,
  UseGuards,
  Get,
  Req,
  Put,
} from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { ActivateUserDto } from 'src/user/dto/active-user.dto';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { Response, Request } from 'express';
import { User, UserDocument } from 'src/user/user.schema';
import { RedisService } from 'src/redis/redis.service';
import { AuthGuard } from './jwt-auth.guard';
import { SocialAuthDto } from 'src/user/dto/social-auth.dto';
import { UpdatePasswordDto } from 'src/user/dto/update-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,

    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  @Post('register')
  async registerUser(@Body() user: CreateUserDto): Promise<Object> {
    const IsUserExists = await this.userService.checkUserByEmail(user.email);
    if (IsUserExists) {
      throw new HttpException('Email already exists', HttpStatus.FOUND);
    }

    return await this.authService.registerUser(user);
  }

  @Post('activate-user')
  async activateUser(@Body() body: ActivateUserDto): Promise<Object> {
    const data = (await this.authService.destructureToken(
      body.activationToken,
      'JWT_SECRET',
    )) as { user: CreateUserDto; activationCode: string };

    if (data.activationCode != body.activationCode) {
      throw new HttpException('Invalid token', HttpStatus.AMBIGUOUS);
    }

    const IsUserExists = await this.userService.checkUserByEmail(
      data.user.email,
    );

    if (IsUserExists) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }

    await this.userService.createUser(data.user);
    return {
      success: true,
    };
  }

  @Post('login')
  async login(
    @Body() loginBody: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const user = await this.userService.checkUserByEmail(loginBody.email);
      if (!user) {
        throw new HttpException('Invalid email id', HttpStatus.NOT_ACCEPTABLE);
      }

      if (!(await user.comparePassword(loginBody.password))) {
        throw new HttpException('Invalid password', HttpStatus.CONFLICT);
      }

      await this.redisService.setKey(user._id.toString(), user);

      const accesstoken = await this.authService.generateAccessToken(
        user._id.toString(),
      );

      const refreshToken = await this.authService.generateRefreshToken(
        user._id.toString(),
      );

      res.cookie(
        'access_token',
        accesstoken,
        this.authService.getAccessTokenCookieOptions(),
      );

      res.cookie(
        'refresh_token',
        refreshToken,
        this.authService.getRefreshTokenCookieOptions(),
      );

      return {
        success: true,
        user: user,
        accessToken: accesstoken,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(AuthGuard)
  @Get('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
    @Req() req: any,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      res.cookie('access_token', '', { maxAge: 1 });
      res.cookie('refresh_token', '', { maxAge: 1 });

      await this.redisService.deleteKey(req.user._id.toString());

      return {
        success: true,
        message: 'User has been loggged out successfully',
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('refresh')
  async updateAccessToken(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    success: boolean;
    access_token: string;
    // user: User;
  }> {
    try {
      const refresh_token = req.cookies['refresh_token'];

      if (!refresh_token) {
        throw new HttpException(
          'Refresh token must be provided',
          HttpStatus.NOT_FOUND,
        );
      }

      const result = (await this.authService.destructureToken(
        refresh_token,
        'JWT_REFERESH_TOKEN_SECRET',
      )) as { id: string };

      if (!result) {
        throw new HttpException('Invalid access token', HttpStatus.CONFLICT);
      }

      const redisUser = await this.redisService.getKey(result.id);

      if (!redisUser) {
        throw new HttpException('Invalid user', HttpStatus.NOT_ACCEPTABLE);
      }

      const user = JSON.parse(redisUser);

      const accesstoken = await this.authService.generateAccessToken(user._id);

      res.cookie(
        'access_token',
        accesstoken,
        this.authService.getAccessTokenCookieOptions(),
      );

      return {
        success: true,
        access_token: accesstoken,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('socialAuth')
  async socialAuth(
    @Body() userData: SocialAuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<object> {
    try {
      var user: UserDocument = await this.userService.checkUserByEmail(
        userData.email,
      );

      if (!user) {
        user = await this.userService.createUser(userData);
      }

      await this.redisService.setKey(user._id.toString(), user);

      const accesstoken = await this.authService.generateAccessToken(
        user._id.toString(),
      );

      const refreshToken = await this.authService.generateRefreshToken(
        user._id.toString(),
      );

      res.cookie(
        'access_token',
        accesstoken,
        this.authService.getAccessTokenCookieOptions(),
      );

      res.cookie(
        'refresh_token',
        refreshToken,
        this.authService.getRefreshTokenCookieOptions(),
      );

      return {
        success: true,
        user: user,
        accessToken: accesstoken,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(AuthGuard)
  @Put('update-password')
  async updatePassword(
    @Req() req,
    @Body() passwordBody: UpdatePasswordDto,
  ): Promise<{
    success: boolean;
    user: UserDocument;
  }> {
    try {
      const user = await this.userService.getUserById(req.user._id);

      if (!(await user.comparePassword(passwordBody.oldPassword))) {
        throw new HttpException('Invalid Password', HttpStatus.AMBIGUOUS);
      }

      user.password = passwordBody.newPassword;

      await user.save();

      await this.redisService.setKey(user._id.toString(), user);

      return {
        success: true,
        user: user,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
