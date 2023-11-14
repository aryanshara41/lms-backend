import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CloudinaryModule } from 'nestjs-cloudinary';

@Module({
  imports: [
    CloudinaryModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        isGlobal: true,
        cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
        api_key: configService.get<string>('CLOUDINARY_API_KEY'),
        api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class NestCloudinary {}
