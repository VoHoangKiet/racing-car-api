import { StatusEnum } from '@Constant/enums';
import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  status: StatusEnum;

  @Expose()
  name: string;

  @Expose()
  dateOfBirth: Date;

  @Expose()
  address: string;

  @Expose()
  identityId: string;

  @Expose()
  avatar: string;

  @Expose()
  createdAt: Date;
}
