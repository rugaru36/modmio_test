import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReqWithUser } from '../auth/interfaces/requestWithUser.interface';
import { JwtAuthGuard } from '../auth/jwt/auth/jwt-auth.guard';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  @Inject(UserService)
  private readonly userService: UserService;

  @UseGuards(JwtAuthGuard)
  @Get('/all/regular')
  public async getAll(
    @Req() req: ReqWithUser,
    @Query('sortby') sortby: string | undefined,
    @Query('take') take: number,
    @Query('skip') skip: number,
  ): Promise<User[]> {
    return await this.userService.getAllRegularUsers(
      req.user,
      take,
      skip,
      sortby,
    );
  }

  @Get('/activate/:code')
  public async activateRegularUserProfile(@Param('code') code: string) {
    await this.userService.activateRegularUserProfile(code);
    return { status: 'success' };
  }
}
