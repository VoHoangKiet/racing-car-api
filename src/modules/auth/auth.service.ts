import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { CredentialsDto } from './dto/credentials.dto';
import { StatusEnum } from '@Constant/enums';
import { UserPayloadDto } from './dto/user-payload.dto';
import { ResponseItem } from '@app/common/dtos';
import { TokenDto } from './dto/token.dto';
import { User, UserDocument } from '@app/database/schemas/user.schema';
import { TokenService } from './token/token.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private readonly tokenService: TokenService
  ) {}

  async validateUser(credentialsDto: CredentialsDto): Promise<UserPayloadDto> {
    const user = await this.userModel
      .findOne({
        email: credentialsDto.email,
        status: StatusEnum.ACTIVE,
        deletedAt: null,
      })
      .select('+password');

    if (!user) throw new UnauthorizedException('Tài khoản không tồn tại');

    const comparePassword = bcrypt.compareSync(credentialsDto.password, user.password);
    if (!comparePassword) throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };
  }

  async login(userPayloadDto: UserPayloadDto): Promise<ResponseItem<TokenDto>> {
    const { accessToken, refreshToken } = this.tokenService.generateTokens(userPayloadDto);

    await this.tokenService.saveRefreshToken(userPayloadDto.id, refreshToken);

    const data = {
      name: userPayloadDto.name,
      accessToken,
      refreshToken,
    };

    return new ResponseItem(data, 'Đăng nhập thành công');
  }

  async logout(userId: string) {
    await this.tokenService.removeRefreshToken(userId);
    return new ResponseItem('', 'Đăng xuất thành công');
  }

  async refreshToken(token: string): Promise<ResponseItem<TokenDto>> {
    const user = await this.tokenService.validateRefreshToken(token);
    const accessToken = this.tokenService.generateAccessToken({ sub: (user as any)._id.toString(), email: user.email });

    const data = {
      accessToken,
    };

    return new ResponseItem(data, 'Làm mới token thành công');
  }
}
