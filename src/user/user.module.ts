import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RegularUserActivationCode } from './entities/regular-user-activation-code.entity';
import { EmailModule } from '../shared/email/email.module';
import { AdminUserCredentials } from './entities/admin-user-credentials.entity';
import { RegularUserCredentials } from './entities/regular-user-credentials.entity';

@Module({
  imports: [
    EmailModule,
    TypeOrmModule.forFeature([
      User,
      RegularUserActivationCode,
      AdminUserCredentials,
      RegularUserCredentials,
    ]),
  ],
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
