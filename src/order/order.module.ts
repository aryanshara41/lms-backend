import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { orderSchema } from './order.schema';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { EmailModule } from 'src/email/email.module';
import { CourseModule } from 'src/course/course.module';
import { UserModule } from 'src/user/user.module';
import { NotificationModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Order',
        schema: orderSchema,
      },
    ]),
    EmailModule,
    CourseModule,
    UserModule,
    NotificationModule

  ],
  providers: [OrderService],
  controllers: [OrderController],
  exports: [MongooseModule]
})
export class OrderModule {}
