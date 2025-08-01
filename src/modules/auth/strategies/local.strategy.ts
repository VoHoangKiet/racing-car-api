import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { AuthService } from '../auth.service';
import { UserPayloadDto } from '../dto/user-payload.dto';
import { CredentialsDto } from '../dto/credentials.dto';
import { ResponseItem } from '@app/common/dtos';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<UserPayloadDto | ResponseItem<null>> {
    const credentialsDto = { email, password } as CredentialsDto;
    return await this.authService.validateUser(credentialsDto);
  }
}
