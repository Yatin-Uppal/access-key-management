import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateAccessKeyDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  rateLimit: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  expirationDays: number;
}
