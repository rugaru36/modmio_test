import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../auth.service';
import { User } from '../../../user/entities/user.entity';

@Injectable()
export class LocalAdminUserAuthStrategy extends PassportStrategy(
  Strategy,
  'admin-user',
) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }
  async validate(email: string, password: string): Promise<User> {
    console.log({ email, password });
    return this.authService.getAuthenticatedAdminUser(email, password);
  }
}
