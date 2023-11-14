import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { NestCloudinary } from './NestCloudinary/NestCloudinary.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { RolesGuard } from './roles.guard';
import { AuthGuard } from './auth/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { CourseModule } from './course/course.module';
import { OrderModule } from './order/order.module';
import { NotificationModule } from './notifications/notifications.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AnalyticsModule } from './analytics/analytics.module';
import { LayoutModule } from './layout/layout.module';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    NestCloudinary,
    UserModule,
    AuthModule,
    EmailModule,
    CourseModule,
    OrderModule,
    NotificationModule,
    OrderModule,
    AnalyticsModule,
    LayoutModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, RolesGuard],
  exports: [],
})
export class AppModule {}
