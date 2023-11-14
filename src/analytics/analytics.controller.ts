import {
  Controller,
  UseGuards,
  Get,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/roles.decorator';
import { RolesGuard } from 'src/roles.guard';
import { UserRole } from 'src/user/user.schema';
import { AnalyticsService } from './analytics.service';

@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('get-user-analytics')
  async getUserAnalytics() {
    try {
      return await this.analyticsService.countLast12Months('User');
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('get-course-analytics')
  async getCourseAnalytics() {
    try {
      return await this.analyticsService.countLast12Months('Course');
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('get-order-analytics')
  async getOrderAnalytics() {
    try {
      return await this.analyticsService.countLast12Months('Order');
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
