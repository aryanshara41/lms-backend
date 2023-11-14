import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { UserDocument } from 'src/user/user.schema';
import { CreateOrderDto } from './create-order.dto';
import { CourseService } from 'src/course/course.service';
import { UserService } from 'src/user/user.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './order.schema';
import { NotificationService } from 'src/notifications/notifications.service';
import { Course } from 'src/course/course.schema';

@Injectable()
export class OrderService {
  constructor(
    private readonly emailService: EmailService,
    private readonly courseService: CourseService,
    private readonly userService: UserService,
    private readonly notificatoinService: NotificationService,
    @InjectModel('Order') private orderModel: Model<Order>,
  ) {}

  async getAllOrders(): Promise<Order[]> {
    return await this.orderModel.find({}).sort({ createdAt: -1 });
  }

  async createOrder(
    userId: string,
    orderData: CreateOrderDto,
  ): Promise<Course> {
    try {
      const course = await this.courseService.getCourseById(orderData.courseId);

      if (!course) {
        throw new HttpException('CourseId is not valid', HttpStatus.NOT_FOUND);
      }

      const user = await this.userService.getUserById(userId);

      const IsAlreadyPurchased = user.courses.some(
        (course) => course === orderData.courseId,
      );

      if (IsAlreadyPurchased) {
        throw new HttpException(
          'You have already purchased this course',
          HttpStatus.CONFLICT,
        );
      }

      const order = await this.orderModel.create({
        courseId: orderData.courseId,
        userId: user._id,
        payment_info: orderData.payment_info,
      });

      // now send the email to the user
      await this.emailService.sendMail(
        user.email,
        'Course purchase order confirmation',
        'orderConfirmation',
        {
          orderDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          orderPrice: course.price,
          orderName: course.name,
          orderId: order._id.toString().slice(0, 6),
        },
      );

      user.courses.push(course['_id']);

      // now create the notification
      await this.notificatoinService.createNotification({
        user: user._id.toString(),
        title: 'New Order',
        message: `You have a new order from ${course.name}`,
      });

      course.purchased++;

      await course.save();

      await user.save();

      return course;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
