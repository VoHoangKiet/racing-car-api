import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { CredentialsDto } from './dto/credentials.dto';
import { StatusEnum } from '@Constant/enums';
import { UserPayloadDto } from './dto/user-payload.dto';
import { ResponseItem } from '@app/common/dtos';
import { TokenDto } from './dto/token.dto';
import { UserEntity } from '@Entity/user.entity';
import { TokenService } from './token/token.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private readonly tokenService: TokenService
  ) {}

  async validateUser(credentialsDto: CredentialsDto): Promise<UserPayloadDto> {
    const user = await this.userRepository.findOneBy({
      email: credentialsDto.email,
      status: StatusEnum.ACTIVE,
      deletedBy: null,
    });

    if (!user) throw new UnauthorizedException('Tài khoản không tồn tại');

    const comparePassword = bcrypt.compareSync(credentialsDto.password, user.password);
    if (!comparePassword) throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');

    return {
      id: user.id,
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
    const accessToken = this.tokenService.generateAccessToken({ sub: user.id, email: user.email });

    const data = {
      accessToken,
    };

    return new ResponseItem(data, 'Làm mới token thành công');
  }
}
