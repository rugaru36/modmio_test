import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRegularUserDto {
  @IsEmail()
  @ApiProperty()
  public email: string;
  @IsString()
  @IsNotEmpty()
  public userName: string;
  @IsString()
  @MinLength(5)
  public plainPassword: string;
}
