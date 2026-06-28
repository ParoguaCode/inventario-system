import { IsIn, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateMovementDto {
  @IsInt()
  @Min(1)
  quantity: number;

  @IsIn(['IN', 'OUT'])
  type: 'IN' | 'OUT';

  @IsString()
  @IsNotEmpty()
  reason: string;
}
