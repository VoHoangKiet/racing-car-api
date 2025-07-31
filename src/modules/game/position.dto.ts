import { IsNumber, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PositionCoordinatesDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;
}

export class PositionDto {
  @IsObject()
  @ValidateNested()
  @Type(() => PositionCoordinatesDto)
  pos: PositionCoordinatesDto;

  @IsNumber()
  rot: number;
}
