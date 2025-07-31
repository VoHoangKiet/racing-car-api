import { Seeder } from 'nestjs-seeder';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@app/database/entities/user.entity';
import { StatusEnum } from '@Constant/enums';

@Injectable()
export class UserSeeder implements Seeder {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async seed(): Promise<void> {
    const users = [
      {
        email: 'admin',
        password: '123123',
        name: 'Admin',
        role: 'ADMIN',
        status: StatusEnum.ACTIVE,
        phone: '0909090909',
        identityId: '1234567890',
        address: '1234567890',
        dateOfBirth: new Date('1990-01-01'),
      },
      {
        email: 'manager',
        password: '123123',
        name: 'Manager',
        role: 'MANAGER',
        status: StatusEnum.ACTIVE,
        phone: '0909090909',
        identityId: '1234567890',
        address: '1234567890',
        dateOfBirth: new Date('1990-01-01'),
      },
      {
        email: 'user',
        password: '123123',
        name: 'User',
        role: 'USER',
        status: StatusEnum.ACTIVE,
        phone: '0909090909',
        identityId: '1234567890',
        address: '1234567890',
        dateOfBirth: new Date('1990-01-01'),
      },
    ];

    for (const userData of users) {
      const existingUser = await this.userRepository.findOne({
        where: { email: userData.email },
      });

      if (!existingUser) {
        const user = this.userRepository.create(userData);

        await this.userRepository.save(user);
      } else {
        throw new BadRequestException(`User ${userData.name} already exists`);
      }
    }
  }

  async drop(): Promise<void> {
    await this.userRepository.delete({});
  }
}
