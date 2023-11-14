import {
  Controller,
  Get,
  Put,
  Req,
  UseGuards,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  FileTypeValidator,
  Delete,
  Param,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/jwt-auth.guard';
import { User, UserDocument, UserRole } from './user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'nestjs-cloudinary';
import { Roles } from 'src/roles.decorator';
import { RolesGuard } from 'src/roles.guard';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { Response } from 'express';

@Controller('user')
@UseGuards(AuthGuard, RolesGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('me')
  async getMyProfile(
    @Req() req: any,
    @Res({ passthrough: true }) response: Response,
  ): Promise<User> {
    return req.user;
  }

  @UseInterceptors(FileInterceptor('file'))
  @Put('update-profile-picture')
  async updateProfilePicture(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'image/*' })],
      }),
    )
    file: Express.Multer.File,
    @Req() req,
  ): Promise<{
    success: true;
    user: UserDocument;
  }> {
    try {
      const uploadedPic = await this.cloudinaryService.uploadFile(file);

      const user = await this.userService.uploadProfilePicture(
        req.user._id,
        uploadedPic.public_id,
        uploadedPic.url,
      );

      await this.redisService.setKey(user._id.toString(), user);

      return {
        success: true,
        user,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Some error occured while uploadin profile picture',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('update-user')
  async updateUserInfo(
    @Req() req,
    @Body() userData: UpdateUserDto,
  ): Promise<{
    success: boolean;
    user: UserDocument;
  }> {
    try {
      const updatedUser = await this.userService.updateUser(
        req.user._id,
        userData,
      );

      await this.redisService.setKey(req.user._id.toString(), updatedUser);

      return {
        success: true,
        user: updatedUser,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.FORBIDDEN);
    }
  }

  @Roles(UserRole.ADMIN)
  @Get('get-all-users')
  async getAllUsers(): Promise<User[]> {
    try {
      return await this.userService.getAllUsers();
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles(UserRole.ADMIN)
  @Put('update-user-role')
  async updateUserRole(
    @Body() updateUserRoleBody: UpdateUserRoleDto,
  ): Promise<User> {
    try {
      return await this.userService.updateUserRole(updateUserRoleBody);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async deleteUser(@Param('id') userId: string): Promise<User> {
    try {
      const user = await this.userService.deleteUserById(userId);
      await this.redisService.deleteKey(userId);
      return user;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
