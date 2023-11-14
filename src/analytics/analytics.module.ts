import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { UserModule } from 'src/user/user.module';
import { OrderModule } from 'src/order/order.module';
import { CourseModule } from 'src/course/course.module';

@Module({
  imports: [UserModule, OrderModule, CourseModule],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
