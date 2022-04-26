import {
  Req,
  Controller,
  UseGuards,
  Get,
  ClassSerializerInterceptor,
  UseInterceptors,
  Post,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ReqWithUser } from './interfaces/requestWithUser.interface';
import { JwtAuthGuard } from './jwt/auth/jwt-auth.guard';
import { UserService } from '../user/user.service';
import { CreateRegularUserDto } from '../user/dto/create-regular-user.dto';
import { Request } from 'express';
import { LocalAdminUserAuthGuard } from './local/admin-user/local-admin-user-auth.guard';
import { LocalBaseUserAuthGuard } from './local/base-user/local-base-user-auth.guard';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('/signup')
  public async signUp(@Body() body: CreateRegularUserDto, @Req() req: Request) {
    const user = await this.userService.createRegularUser(body);
    const token = this.authService.getJwtAccessToken(user.id);
    const tokenCookie = this.authService.getCookieWithJwtAccessToken(token);
    req.res.setHeader('Set-Cookie', tokenCookie);
    return { user, token };
  }

  @UseGuards(LocalAdminUserAuthGuard)
  @Post('/signin/admin-user')
  public signInAdminUser(@Req() req: ReqWithUser) {
    const user = req.user;
    const token = this.authService.getJwtAccessToken(user.id);
    const tokenCookie = this.authService.getCookieWithJwtAccessToken(token);
    req.res.setHeader('Set-Cookie', tokenCookie);
    return { user, token };
  }

  @UseGuards(LocalBaseUserAuthGuard)
  @Post('/signin/regular-user')
  public signInRegularUser(@Req() req: ReqWithUser) {
    const user = req.user;
    const token = this.authService.getJwtAccessToken(user.id);
    const tokenCookie = this.authService.getCookieWithJwtAccessToken(token);
    req.res.setHeader('Set-Cookie', tokenCookie);
    return { user, token };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  public authenticate(@Req() req: ReqWithUser) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/refresh/cookie')
  public refreshCookie(@Req() req: ReqWithUser) {
    const token = this.authService.getJwtAccessToken(req.user.id);
    const tokenCookie = this.authService.getCookieWithJwtAccessToken(token);
    req.res.setHeader('Set-Cookie', tokenCookie);
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/refresh')
  public refreshBearer(@Req() req: ReqWithUser) {
    const token = this.authService.getJwtAccessToken(req.user.id);
    return { token };
  }
}
