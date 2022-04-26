import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalBaseUserAuthStrategy } from './local/base-user/local-base-user.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthStrategy } from './jwt/auth/jwt-auth.strategy';
import { LocalAdminUserAuthStrategy } from './local/admin-user/local-admin-user.strategy';

@Module({
  imports: [UserModule, PassportModule, ConfigModule, JwtModule.register({})],
  providers: [
    AuthService,
    LocalBaseUserAuthStrategy,
    LocalAdminUserAuthStrategy,
    JwtAuthStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
