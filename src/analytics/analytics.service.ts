import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { Course } from 'src/course/course.schema';
import { Order } from 'src/order/order.schema';
import { User } from 'src/user/user.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Order') private orderModel: Model<Order>,
    @InjectModel('Course') private courseModel: Model<Course>,
  ) {}

  async countLast12Months(modelName: string) {
    const currentDate = new Date();
    const monthsData: { month: number; count: number }[] = [];

    for (let i = 0; i < 12; i++) {
      const monthStartDate = new Date(currentDate);
      monthStartDate.setUTCMonth(currentDate.getUTCMonth() - i);
      monthStartDate.setUTCDate(1);
      monthStartDate.setUTCHours(0, 0, 0, 0);

      const monthEndDate = new Date(currentDate);
      monthEndDate.setUTCMonth(currentDate.getUTCMonth() - i + 1);
      monthEndDate.setUTCDate(0);
      monthEndDate.setUTCHours(23, 59, 59, 999);

      var count = 0;
      if (modelName == 'User') {
        count = await this.userModel
          .countDocuments({
            createdAt: {
              $gte: monthStartDate,
              $lte: monthEndDate,
            },
          })
          .exec();

      } else if (modelName == 'Order') {
        count = await this.orderModel
          .countDocuments({
            createdAt: {
              $gte: monthStartDate,
              $lte: monthEndDate,
            },
          })
          .exec();
      } else if (modelName == 'Course') {
        count = await this.courseModel
          .countDocuments({
            createdAt: {
              $gte: monthStartDate,
              $lte: monthEndDate,
            },
          })
          .exec();
      }

      monthsData.push({
        month: monthStartDate.getMonth() + 1, // Month is 0-indexed, so add 1.
        count,
      });
    }

    return monthsData;
  }
}
