import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { RedisModule } from 'src/redis/redis.module';
import { CommentModule } from './question/question.module';
import { CourseDataModule } from './courseData/courseData.module';
import { LinkModule } from './link/link.module';
import { ReviewModule } from './review/review.module';
import { MongooseModule } from '@nestjs/mongoose';
import { courseSchema } from './course.schema';
import { EmailModule } from 'src/email/email.module';
import { NotificationModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    CommentModule,
    CourseDataModule,
    LinkModule,
    ReviewModule,
    EmailModule,
    NotificationModule,
    MongooseModule.forFeature([
      {
        name: 'Course',
        schema: courseSchema,
      },
    ]),
  ],
  providers: [CourseService],
  controllers: [CourseController],
  exports: [CourseService, MongooseModule],
})
export class CourseModule {}
