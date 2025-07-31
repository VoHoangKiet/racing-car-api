import { IsEnum, IsOptional } from 'class-validator';
import { PageOptionsDto } from '@app/common/dtos';
import { StatusEnum } from '@Constant/enums';
import { Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetUsersDto extends PageOptionsDto {
  @IsOptional()
  @IsEnum(StatusEnum)
  @Transform(({ value }) => (value === '' ? undefined : value))
  status?: StatusEnum;

  @Expose()
  @ApiProperty({ required: false })
  @IsOptional()
  startDate: Date;

  @Expose()
  @ApiProperty({ required: false })
  @IsOptional()
  endDate: Date;
}
