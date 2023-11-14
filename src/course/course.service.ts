import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { Course, CourseDocument } from './course.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, mongo } from 'mongoose';
import { CloudinaryService } from 'nestjs-cloudinary';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseData, CourseDataDocument } from './courseData/courseData.schema';
import { CreateQuestionDto } from './question/create-question.dto';
import { Question, QuestionDocument } from './question/question.schema';
import { UserDocument } from 'src/user/user.schema';
import { CreateAnswerDto } from './question/create-answer.dto';
import { EmailService } from 'src/email/email.service';
import { CreateReviewDto } from './review/create-review.dto';
import { GetALLQuestionsDto } from './question/getAllQuestionsBody.dto';
import { Review } from './review/review.schema';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel('Course') private courseModel: Model<Course>,
    private readonly emailService: EmailService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async deleteCourseById(courseId: string): Promise<Course> {
    try {
      return await this.courseModel.findByIdAndDelete(courseId);
    } catch (error) {
      throw new HttpException(error, HttpStatus.ACCEPTED);
    }
  }

  async getAllQuestions(body: GetALLQuestionsDto) {
    const course = await this.courseModel.findById(body.courseId);
    if (!course)
      throw new HttpException('Invalid course id', HttpStatus.NOT_FOUND);

    const content = course.courseData.find(
      (singleCourse: CourseDataDocument) => {
        console.log(singleCourse._id);
        return singleCourse._id.equals(body.contentId);
      },
    );

    if (!content) {
      throw new HttpException('Invalid content id', HttpStatus.NOT_FOUND);
    }

    return content.questions.reverse();
  }

  async getCourseById(courseId: string, notWant?: string): Promise<Course> {
    return await this.courseModel.findById(courseId).select(notWant);
  }

  async getAllCoursesForAdmin(): Promise<Course[]> {
    return await this.courseModel.find({}).sort({ createdAt: -1 });
  }

  async getAllCourses(): Promise<Course[]> {
    return await this.courseModel.aggregate([
      {
        $match: {},
      },
      {
        $project: {
          name: 1,
          thumbnail: '$thumbnail.url',
          ratings: 1,
          price: 1,
          estimatedPrice: 1,
          level: 1,
          lectures: { $size: '$courseData' },
        },
      },
    ]);
  }

  async getAllReviews(courseId: string): Promise<Review[]> {
    const course = await this.courseModel
      .findById(courseId)
      .select({ reviews: 1, _id: 0 });

    return course.reviews.reverse();
  }

  async getCourseContent(courseId: string): Promise<any> {
    try {
      // const id = new mongoose.Types.ObjectId(courseId);
      // return this.courseModel.findById(courseId, {
      //   courseData: 1,
      //   'courseData.questions': 0,
      // });

      return await this.courseModel.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(courseId) }, // Match the document by its _id
        },
        {
          $project: {
            courseData: 1,
            name: 1,
          },
        },
        {
          $unwind: '$courseData', // Deconstruct the courseData array
        },
        {
          $project: {
            'courseData.questions': 0,
            // Exclude the 'questions' array from each courseData object
          },
        },
        {
          $group: {
            _id: '$_id',
            courseData: { $push: '$courseData' }, // Group the results back into an array
            name: { $first: '$name' },
          },
        },
      ]);

      // const data = await this.courseModel.aggregate([
      //   { $match: { _id: id } },
      //   {
      //     $project: {
      //       courseData: 1,
      //       _id: 0,
      //     },
      //   },
      //   {
      //     $unwind: '$courseData',
      //   },
      //   {
      //     $group: {
      //       _id: '$courseData.videoSection',
      //       courseContent: { $push: '$courseData' },
      //     },
      //   },
      //   {
      //     $project: {
      //       _id: 0, // Exclude the _id field
      //       videoSection: '$_id', // Rename _id to videoSection
      //       courseContent: 1, // Include the courseContent field
      //     },
      //   },
      // ]);

      // return data;
    } catch (error) {
      console.log(error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async createCourse(course: CreateCourseDto): Promise<CourseDocument> {
    const { thumbnail, ...rest } = course;

    const uploadedPic =
      await this.cloudinary.cloudinaryInstance.uploader.upload(thumbnail);

    rest['thumbnail'] = {
      public_id: uploadedPic.public_id,
      url: uploadedPic.url,
    };

    const createdCourse = await this.courseModel.create(rest);
    return createdCourse;
  }

  async updateCourse(
    courseId: string,
    courseData: UpdateCourseDto,
  ): Promise<CourseDocument> {
    try {
      const course = await this.courseModel.findById(courseId);

      if (!course) {
        throw new HttpException('Invalid course id', HttpStatus.NOT_FOUND);
      }

      const { thumbnail, ...rest } = courseData;

      if (thumbnail) {
        await this.cloudinary.cloudinaryInstance.uploader.destroy(
          course.thumbnail['public_id'],
        );

        const uploadedPic =
          await this.cloudinary.cloudinaryInstance.uploader.upload(thumbnail);

        rest['thumbnail'] = {
          public_id: uploadedPic.public_id,
          url: uploadedPic.url,
        };
      }

      Object.assign(course, rest);

      return await course.save();
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_FOUND);
    }
  }

  async addQuestion(
    user: UserDocument,
    questionData: CreateQuestionDto,
  ): Promise<Question[]> {
    try {
      const course = await this.courseModel.findById(questionData.courseId);

      if (!course) {
        throw new HttpException('Invalid courseId', HttpStatus.NOT_FOUND);
      }

      const content = course.courseData.find((item: CourseDataDocument) =>
        item._id.equals(questionData.contentId),
      );

      if (!content) {
        throw new HttpException('Invalid contentId', HttpStatus.NOT_FOUND);
      }

      const newQuestion = {
        user: {
          avatar: {
            public_id: user.avatar['public_id'],
            url: user.avatar['url'],
          },
          name: user.name,
          _id: user._id,
          email: user.email,
        },
        question: questionData.question,
        questionReplies: [],
      };

      content.questions.push(newQuestion);

      await course.save();

      return content.questions.slice(-1);
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_FOUND);
    }
  }

  async addAnswer(
    user: UserDocument,
    answerData: CreateAnswerDto,
  ): Promise<Course> {
    try {
      const course = await this.courseModel.findById(answerData.courseId);

      if (!course) {
        throw new HttpException('Invalid courseId', HttpStatus.NOT_FOUND);
      }

      const content = course.courseData.find((item: CourseDataDocument) =>
        item._id.equals(answerData.contentId),
      );

      if (!content) {
        throw new HttpException('Invalid contentId', HttpStatus.NOT_FOUND);
      }

      const question = content.questions.find((item: QuestionDocument) =>
        item._id.equals(answerData.questionId),
      );

      if (!question) {
        throw new HttpException('Invalid questionId', HttpStatus.NOT_FOUND);
      }

      const newAnswer = {
        user: {
          avatar: {
            public_id: user.avatar['public_id'],
            url: user.avatar['url'],
          },
          name: user.name,
        },
        question: answerData.answer,
        questionReplies: [],
      };

      question.questionReplies.push(newAnswer);

      await this.emailService.sendMail(
        question.user['email'],
        `New answer added to ${content.title}`,
        'questionreply',
        {
          username: question.user['name'],
          question: content.title,
        },
      );

      return await course.save();
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async addReview(
    courseId: string,
    user: UserDocument,
    reviewData: CreateReviewDto,
  ): Promise<boolean> {
    try {
      const course = await this.courseModel.findById(courseId);

      if (!course) {
        throw new HttpException('Invalid course Id', HttpStatus.NOT_FOUND);
      }

      const newReview = {
        user: {
          avatar: {
            public_id: user.avatar['public_id'],
            url: user.avatar['url'],
          },
          name: user.name,
        },
        rating: reviewData.rating,
        comment: reviewData.review,
      };

      course.reviews.push(newReview);

      let sum = 0,
        length = 0;
      course.reviews.forEach((review) => {
        sum += review.rating;
        length++;
      });

      course.ratings = sum / length;

      await course.save();

      return true;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
