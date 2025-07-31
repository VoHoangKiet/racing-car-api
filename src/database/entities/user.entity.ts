import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { BeforeInsert, Column, Entity, Unique, BeforeUpdate } from 'typeorm';

import { StatusEnum } from '@Constant/enums';
import { AbstractEntity } from '@app/database/entities/abstract.entity';

@Entity('users')
@Unique('UQ_users_email_deletedAt', ['email', 'deletedAt'])
@Unique('UQ_users_identityId_deletedAt', ['identityId', 'deletedAt'])
export class UserEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  password: string;

  @Column({ type: 'enum', enum: StatusEnum, default: StatusEnum.ACTIVE })
  status: StatusEnum;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'timestamp', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'varchar', nullable: true, length: 200 })
  address: string;

  @Column({ type: 'varchar', length: 12, nullable: true })
  identityId: string;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  refreshToken: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  @Column({ type: 'varchar', nullable: true })
  avatar: string;
}
