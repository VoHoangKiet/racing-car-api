import { Expose } from 'class-transformer';
import { UserDto } from './user.dto';
import { UserRoleEnum } from '@Constant/enums';

export class UserWithRoleDto extends UserDto {
  @Expose()
  role: UserRoleEnum;
}
