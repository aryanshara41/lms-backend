import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { SocialAuthDto } from './dto/social-auth.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CloudinaryService } from 'nestjs-cloudinary';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return await this.userModel.find({}).sort({ createdAt: -1 });
  }

  async updateUserRole(updateUserRoleData: UpdateUserRoleDto): Promise<User> {
    try {
      const user = await this.userModel.findById(updateUserRoleData.id);

      if (!user) {
        throw new HttpException('Invalid userId', HttpStatus.NOT_FOUND);
      }

      user.role = updateUserRoleData.role;

      return await user.save();
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async checkUserByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email: email });
  }

  async getUserById(id: string): Promise<UserDocument> {
    return await this.userModel.findById(id);
  }

  async createUser(user: CreateUserDto | SocialAuthDto): Promise<UserDocument> {
    try {
      const newUser = new this.userModel(user);
      return await newUser.save();
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async uploadProfilePicture(
    userId: string,
    public_id: string,
    url: string,
  ): Promise<UserDocument> {
    const user = await this.getUserById(userId);

    if (user.avatar && user.avatar.hasOwnProperty('public_id')) {
      await this.cloudinary.cloudinaryInstance.uploader.destroy(
        user.avatar['public_id'],
      );
    }

    // now store the data
    user.avatar = {
      public_id: public_id,
      url: url,
    };

    await user.save();
    return user;
  }

  async updateUser(
    userId: string,
    userData: UpdateUserDto,
  ): Promise<UserDocument> {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        userData,
      );
      return updatedUser;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_GATEWAY);
    }
  }

  async deleteUserById(userId: string): Promise<UserDocument> {
    try {
      const user = await this.userModel.findByIdAndDelete(userId);
      return user;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_GATEWAY);
    }
  }
}
