import { IsString, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentStock?: number;

  @IsInt()
  @Min(0)
  minThreshold: number;
}
