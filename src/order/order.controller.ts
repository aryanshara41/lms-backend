import {
  Controller,
  UseGuards,
  Post,
  Body,
  Req,
  HttpException,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateOrderDto } from './create-order.dto';
import { OrderService } from './order.service';
import { UserDocument, UserRole } from 'src/user/user.schema';
import { Course } from 'src/course/course.schema';
import { RolesGuard } from 'src/roles.guard';
import { Order } from './order.schema';
import { Roles } from 'src/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create-order')
  async createOrder(
    @Req() req: any,
    @Body() orderBody: CreateOrderDto,
  ): Promise<{
    success: true;
    order: Course;
  }> {
    try {
      const course = await this.orderService.createOrder(
        req.user._id,
        orderBody,
      );

      return {
        success: true,
        order: course,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles(UserRole.ADMIN)
  @Get('get-all-orders')
  async getAllOrders(): Promise<Order[]> {
    try {
      return await this.orderService.getAllOrders();
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
