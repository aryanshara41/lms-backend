import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
  Req,
  Delete,
  Query,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/roles.decorator';
import { RolesGuard } from 'src/roles.guard';
import { UserRole } from 'src/user/user.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { Course, CourseDocument } from './course.schema';
import { CourseService } from './course.service';
import { UpdateCourseDto } from './dto/update-course.dto';
import { RedisService } from 'src/redis/redis.service';
import { CourseData } from './courseData/courseData.schema';
import { CreateQuestionDto } from './question/create-question.dto';
import { CreateAnswerDto } from './question/create-answer.dto';
import { CreateReviewDto } from './review/create-review.dto';
import { NotificationService } from 'src/notifications/notifications.service';
import { GetALLQuestionsDto } from './question/getAllQuestionsBody.dto';
import { Review } from './review/review.schema';

@Controller('course')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly redisService: RedisService,
    private readonly notificationService: NotificationService,
  ) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('create-course')
  async createCourse(@Body() course: CreateCourseDto): Promise<CourseDocument> {
    try {
      const createdCourse = await this.courseService.createCourse(course);

      this.redisService.deleteKey('all-courses');

      return createdCourse;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Something error occured',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put('update-course/:id')
  async updateCourse(
    @Param('id') id: string,
    @Body() courseData: UpdateCourseDto,
  ): Promise<{
    message: boolean;
    course: CourseDocument;
  }> {
    try {
      const course = await this.courseService.updateCourse(id, courseData);

      await this.redisService.deleteKey('all-courses');

      await this.redisService.deleteKey(id);

      return {
        message: true,
        course: course,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.CONFLICT);
    }
  }

  @Get('get-course/:courseId')
  async getCourseDataWithoutPurchase(
    @Param('courseId') courseId: string,
  ): Promise<{
    success: true;
    course: Course;
  }> {
    try {
      const redisCourse = await this.redisService.getKey(courseId);

      if (redisCourse) {
        return {
          success: true,
          course: await JSON.parse(redisCourse),
        };
      }

      const notwant =
        '-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links';
      const course = await this.courseService.getCourseById(courseId, notwant);

      await this.redisService.setKey(courseId, course);

      return {
        success: true,
        course: course,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('get-all-courses')
  async getAllCoursesWithoutPurchase(): Promise<{
    success: true;
    courses: Course[];
  }> {
    try {
      console.log('Got one request', new Date().getTime());
      const redisCourses = await this.redisService.getKey('all-courses');

      if (redisCourses) {
        return {
          success: true,
          courses: JSON.parse(redisCourses),
        };
      }

      const courses = await this.courseService.getAllCourses();

      await this.redisService.setKey('all-courses', courses);

      return {
        success: true,
        courses: courses,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('courses')
  async getAllCoursesByAdmin(): Promise<Course[]> {
    try {
      return await this.courseService.getAllCoursesForAdmin();
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(AuthGuard)
  @Get('course-content/:courseId')
  async getCourseContent(
    @Req() req: any,
    @Param('courseId') courseId: string,
  ): Promise<{
    success: boolean;
    courseContent: CourseData;
  }> {
    try {
      const user = req.user;

      // console.log(user, courseId);

      if (!user.courses.includes(courseId)) {
        console.log(user.courses, courseId);
        throw new HttpException(
          'You are not allowed to access this course',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }

      const courseData = await this.courseService.getCourseContent(courseId);

      if (courseData.length == 0) {
        return {
          success: false,
          courseContent: null,
        };
      }

      return {
        success: true,
        courseContent: courseData[0],
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(AuthGuard)
  @Put('add-question')
  async addQuestion(@Req() req: any, @Body() questionData: any) {
    return questionData;
    try {
      const addedQuestion = await this.courseService.addQuestion(
        req.user,
        questionData,
      );
      await this.notificationService.createNotification({
        user: req.user._id,
        title: 'New Question has been added',
        message: `You have a new question fron ${req.user.name}`,
      });

      return addedQuestion[0];
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(AuthGuard)
  @Get('get-all-questions')
  async getAllQuestions(@Query() body: GetALLQuestionsDto) {
    try {
      const questions = await this.courseService.getAllQuestions(body);
      return questions;
    } catch (error: any) {
      return new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Put('add-answer')
  async addAnswer(
    @Req() req: any,
    @Body() answerData: CreateAnswerDto,
  ): Promise<{
    success: boolean;
    course: Course;
  }> {
    try {
      const course = await this.courseService.addAnswer(req.user, answerData);

      return {
        success: true,
        course: course,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(AuthGuard)
  @Put('add-review/:courseId')
  async addReview(
    @Param('courseId') courseId: string,
    @Req() req: any,
    @Body() reviewData: CreateReviewDto,
  ): Promise<{ success: boolean }> {
    try {
      const isSubmitted = await this.courseService.addReview(
        courseId,
        req.user,
        reviewData,
      );
      if (isSubmitted) {
        return {
          success: true,
        };
      } else {
        return {
          success: false,
        };
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(AuthGuard)
  @Get('get-all-reviews/:courseId')
  async getAllReviews(@Param('courseId') courseId: string): Promise<{
    success: boolean;
    reviews: Review[];
  }> {
    try {
      const reviews = await this.courseService.getAllReviews(courseId);
      return {
        success: true,
        reviews: reviews,
      };
    } catch (error) {
      throw new HttpException('Something went wrong', HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async deleteCourse(@Param('id') courseId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const course = await this.courseService.deleteCourseById(courseId);
      await this.redisService.deleteKey(courseId);

      return {
        success: true,
        message: 'Course deleted successfully',
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
