import { Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './interfaces/tokenPayload.interface';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  @Inject(UserService)
  private readonly usersService: UserService;
  @Inject(JwtService)
  private readonly jwtService: JwtService;
  @Inject(ConfigService)
  private readonly configService: ConfigService;

  public getJwtAccessToken(userId: number): string {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      )}`,
    });
    return token;
  }

  public getCookieWithJwtAccessToken(token: string): string {
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
    )}`;
  }

  public getCookieWithJwtRefreshToken(userId: number) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      )}`,
    });
    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    )}`;
    return {
      cookie,
      token,
    };
  }

  public getCookiesForLogOut() {
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0',
    ];
  }

  public async getAuthenticatedRegularUser(
    email: string,
    plainPassword: string,
  ): Promise<User | null> {
    const cred = await this.usersService.getRegularUserCreds(email);
    if (!cred) return null;
    const isPasswordCorrect = await this.verifyPassword(
      plainPassword,
      cred.hashedPassword,
    );
    return isPasswordCorrect ? await cred.user : null;
  }

  public async getAuthenticatedAdminUser(
    email: string,
    plainPassword: string,
  ): Promise<User | null> {
    const cred = await this.usersService.getAdminUserCreds(email);
    console.log({ cred });
    if (!cred) return null;
    const isPasswordCorrect = await this.verifyPassword(
      plainPassword,
      cred.hashedPassword,
    );
    return isPasswordCorrect ? await cred.user : null;
  }

  private async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
