import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';
import * as fs from 'fs';
import { Model } from 'mongoose';
import { PageMetaDto, ResponseItem, ResponsePaginate } from '@app/common/dtos';
import { convertPath } from '@app/common/utils';
import { StatusEnum } from '@Constant/enums';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '@UsersModule/dto/create-user.dto';
import { GetUsersDto } from '@UsersModule/dto/get-users.dto';
import { UpdateUserDto } from '@UsersModule/dto/update-user.dto';
import { User, UserDocument } from '@app/database/schemas/user.schema';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ProfileDto } from './dto/profile.dto';
import { UserDto } from './dto/user.dto';
import { avtPathName, baseImageUrl } from '@Constant/url';

// Helper function to convert MongoDB document to UserDto
function toUserDto(user: UserDocument): UserDto {
  const userObj = user.toObject();
  return {
    id: userObj._id.toString(),
    email: userObj.email,
    phone: userObj.phone,
    status: userObj.status as StatusEnum,
    name: userObj.name,
    dateOfBirth: userObj.dateOfBirth,
    address: userObj.address,
    identityId: userObj.identityId,
    avatar: userObj.avatar,
    createdAt: userObj.createdAt,
  };
}

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) {}

  async create(avatar, params: CreateUserDto): Promise<ResponseItem<UserDto>> {
    const emailExisted = await this.userModel.findOne({
      email: params.email,
      deletedAt: null,
    });
    if (emailExisted) throw new BadRequestException('Email đã tồn tại');

    const identityIdExisted = await this.userModel.findOne({
      identityId: params.identityId,
      deletedAt: null,
    });
    if (identityIdExisted) {
      throw new BadRequestException('CMND/CCCD đã tồn tại');
    }

    const existPhone = await this.userModel.findOne({
      phone: params.phone,
      deletedAt: null,
    });
    if (existPhone) throw new BadRequestException('Số điện thoại đã tồn tại');

    if (avatar) {
      params = { ...params, avatar: avtPathName('users', avatar.filename) };
    } else {
      params = { ...params, avatar: null };
    }

    const user = await this.userModel.create(params);

    return new ResponseItem(toUserDto(user), 'Tạo mới dữ liệu thành công');
  }

  async resetPassword(id: string): Promise<ResponseItem<UserDto>> {
    const user = await this.userModel.findOne({ _id: id, deletedAt: null });
    if (!user) {
      throw new BadRequestException('Nhân viên không tồn tại');
    }
    const newPassword = await bcrypt.hash(this.configService.get<string>('RESET_PASSWORD'), 10);

    await this.userModel.findByIdAndUpdate(id, {
      password: newPassword,
    });

    const response = await this.userModel.findOne({ _id: id, deletedAt: null });

    const result = {
      ...toUserDto(response),
      password: this.configService.get<string>('RESET_PASSWORD'),
    };

    return new ResponseItem(result, 'Đặt lại mật khẩu thành công');
  }

  async changePassword(id: string, data: ChangePasswordDto): Promise<ResponseItem<UserDto>> {
    const user = await this.userModel.findOne({ _id: id, deletedAt: null }).select('+password');
    if (!user || !bcrypt.compareSync(data.oldPassword, user.password)) {
      throw new BadRequestException('Mật khẩu cũ không chính xác');
    }

    const password = await bcrypt.hash(data.newPassword, 10);
    await this.userModel.findByIdAndUpdate(id, { password });

    return new ResponseItem(toUserDto(user), 'Thay đổi mật khẩu thành công');
  }

  async getUsers(params: GetUsersDto): Promise<ResponsePaginate<UserDto>> {
    const filter: any = {
      status: { $in: params.status ? [params.status] : [StatusEnum.ACTIVE, StatusEnum.INACTIVE] },
      name: { $regex: params.search ?? '', $options: 'i' },
    };

    if (params.startDate && params.endDate) {
      filter.createdAt = {
        $gte: new Date(params.startDate),
        $lte: new Date(params.endDate),
      };
    }

    const skip = params.skip || 0;
    const limit = params.take || 10;
    const sortField = params.orderBy || 'createdAt';
    const sortOrder = params.order === 'ASC' ? 1 : -1;

    const [result, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    const pageMetaDto = new PageMetaDto({ itemCount: total, pageOptionsDto: params });

    return new ResponsePaginate(result, pageMetaDto, 'Thành công', UserDto);
  }

  async getUser(id: string): Promise<ResponseItem<UserDto>> {
    const user = await this.userModel.findById(id);
    if (!user) throw new BadRequestException('Người dùng không tồn tại');

    const dto = {
      ...toUserDto(user),
    };

    return new ResponseItem(dto, 'Thành công');
  }

  async getProfile(id: string): Promise<ResponseItem<ProfileDto>> {
    const user = await this.userModel.findById(id);

    const result = plainToClass(
      ProfileDto,
      { ...user.toObject(), avatar: user?.avatar ? baseImageUrl + convertPath(user.avatar) : null },
      { excludeExtraneousValues: true }
    );

    return new ResponseItem(result, 'Thành công');
  }

  async updateProfile(id: string, updateUserDto: UpdateUserDto): Promise<ResponseItem<UserDto>> {
    const user = await this.userModel.findOne({ _id: id, deletedAt: null });
    if (!user) {
      throw new BadRequestException('Thông tin cá nhân không tồn tại');
    }

    const identityIdExisted = await this.userModel.findOne({
      identityId: updateUserDto.identityId,
      _id: { $ne: id },
      deletedAt: null,
    });
    if (identityIdExisted) {
      throw new BadRequestException('CMND/CCCD đã tồn tại');
    }

    const phoneExisted = await this.userModel.findOne({
      phone: updateUserDto.phone,
      _id: { $ne: id },
      deletedAt: null,
    });
    if (phoneExisted) {
      throw new BadRequestException('Số điện thoại đã tồn tại');
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      {
        ...plainToClass(UpdateUserDto, updateUserDto, { excludeExtraneousValues: true }),
      },
      { new: true }
    );

    return new ResponseItem(toUserDto(updatedUser), 'Cập nhật dữ liệu thành công');
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<ResponseItem<UserDto>> {
    const user = await this.userModel.findOne({ _id: id, deletedAt: null });
    if (!user) {
      throw new BadRequestException('Nhân viên không tồn tại');
    }

    const emailExisted = await this.userModel.findOne({
      email: updateUserDto.email,
      _id: { $ne: id },
      deletedAt: null,
    });
    if (emailExisted) throw new BadRequestException('Email đã tồn tại');

    const identityIdExisted = await this.userModel.findOne({
      identityId: updateUserDto.identityId,
      _id: { $ne: id },
      deletedAt: null,
    });
    if (identityIdExisted) {
      throw new BadRequestException('CMND/CCCD đã tồn tại');
    }

    const phoneExisted = await this.userModel.findOne({
      phone: updateUserDto.phone,
      _id: { $ne: id },
      deletedAt: null,
    });
    if (phoneExisted) {
      throw new BadRequestException('Số điện thoại đã tồn tại');
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      {
        ...plainToClass(UpdateUserDto, updateUserDto, { excludeExtraneousValues: true }),
      },
      { new: true }
    );

    return new ResponseItem(toUserDto(updatedUser), 'Cập nhật dữ liệu thành công');
  }

  async deleteUser(id: string): Promise<ResponseItem<null>> {
    const user = await this.userModel.findOne({ _id: id, deletedAt: null });
    if (!user) throw new BadRequestException('Người dùng không tồn tại');
    if (user.status === StatusEnum.ACTIVE) throw new BadRequestException('Không được xóa nhân viên đang hoạt động');

    await this.userModel.findByIdAndUpdate(id, { deletedAt: new Date() });

    return new ResponseItem(null, 'Xóa nhân viên thành công');
  }

  async uploadAvatar(identityId: string, file: Express.Multer.File): Promise<ResponseItem<any>> {
    const user = await this.userModel.findOne({ identityId, deletedAt: null });

    if (!user) {
      throw new BadRequestException('Nhân viên không tồn tại');
    }

    await this.userModel.findOneAndUpdate(
      { identityId },
      {
        avatar: avtPathName('users', file.filename),
      }
    );

    if (fs.existsSync(user.avatar)) {
      fs.unlinkSync(user.avatar);
    }

    return new ResponseItem(null, 'Cập nhật thông tin thành công');
  }

  async removeAvatar(identityId: string): Promise<ResponseItem<any>> {
    const user = await this.userModel.findOne({ identityId, deletedAt: null });

    if (!user) {
      throw new BadRequestException('Nhân viên không tồn tại');
    }

    await this.userModel.findOneAndUpdate(
      { identityId },
      {
        avatar: null,
      }
    );

    if (fs.existsSync(user.avatar)) {
      fs.unlinkSync(user.avatar);
    }

    return new ResponseItem(null, 'Xóa ảnh đại diện thành công');
  }

  async getUserEntityById(id: string): Promise<User> {
    const user = await this.userModel.findOne({ _id: id, deletedAt: null });
    if (!user) throw new BadRequestException('Người dùng không tồn tại');
    return user;
  }
}
