import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { CookieOptions } from 'express';
import { SocialAuthDto } from 'src/user/dto/social-auth.dto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async generateToken(
    time: string,
    secretKey: string,
    data?: any,
  ): Promise<string> {
    return await this.jwtService.signAsync(data, {
      secret: this.configService.get<string>(secretKey),
      expiresIn: time,
    });
  }

  async generateAccessToken(id: string): Promise<string> {
    return await this.generateToken(
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRE'),
      'JWT_ACCESS_TOKEN_SECRET',
      { id: id },
    );
  }

  getAccessTokenCookieOptions(): CookieOptions {
    const access_token_expire = parseInt(
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRE'),
    );

    return {
      expires: new Date(Date.now() + 5 * 60 * 1000),
      maxAge: 300 * 1000,
      httpOnly: true,
      sameSite: 'none',
      path: '/',
    };
  }

  getRefreshTokenCookieOptions(): CookieOptions {
    const refresh_token_expire = parseInt(
      this.configService.get<string>('JWT_REFERESH_TOKEN_EXPIRE'),
    );

    return {
      expires: new Date(
        Date.now() + refresh_token_expire * 24 * 60 * 60 * 1000,
      ),
      maxAge: refresh_token_expire * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'lax',
    };
  }

  async generateRefreshToken(id: string): Promise<string> {
    return await this.generateToken(
      this.configService.get<string>('JWT_REFERESH_TOKEN_EXPIRE'),
      'JWT_REFERESH_TOKEN_SECRET',
      { id: id },
    );
  }

  async destructureToken(token: string, secret: string): Promise<Object> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>(secret),
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  getActivationCode() {
    const randomNumber = Math.random() * 9000 + 1000;
    return Math.floor(randomNumber);
  }

  async registerUser(user: CreateUserDto | SocialAuthDto): Promise<object> {
    const activationCode = this.getActivationCode();

    const activationToken = await this.generateToken('5m', 'JWT_SECRET', {
      user,
      activationCode,
    });

    await this.emailService.sendMail(
      user.email,
      'Welcome User',
      'verification',
      {
        authenticationCode: activationCode,
      },
    );

    return {
      success: true,
      message: 'Please check your email to activate your account',
      activationToken: activationToken,
    };
  }
}
