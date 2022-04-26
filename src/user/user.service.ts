import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { hash } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { CreateRegularUserDto } from './dto/create-regular-user.dto';
import { RegularUserActivationCode } from './entities/regular-user-activation-code.entity';
import { EmailService } from '../shared/email/email.service';
import { RegularUserCredentials } from './entities/regular-user-credentials.entity';
import { AdminUserCredentials } from './entities/admin-user-credentials.entity';
import { UserRoles } from './entities/user-roles.entity';
import { CreateAdminUserDto } from './dto/create-regular-user.dto copy';

@Injectable()
export class UserService {
  @Inject(EmailService)
  private readonly emailService: EmailService;
  @InjectRepository(RegularUserActivationCode)
  private readonly regularUserActivationCodeRepository: Repository<RegularUserActivationCode>;
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;
  @InjectRepository(RegularUserCredentials)
  private readonly regularUserCredentialsRepository: Repository<RegularUserCredentials>;
  @InjectRepository(AdminUserCredentials)
  private readonly adminUserCredentialsRepository: Repository<AdminUserCredentials>;

  public async getAllRegularUsers(
    user: User,
    take: number,
    skip: number,
    sortby: string | undefined,
  ): Promise<User[]> {
    try {
      if (!user.userRoles.isAdminUser) {
        throw new HttpException('user is not admin', HttpStatus.FORBIDDEN);
      }
      const options: FindManyOptions<User> = {
        where: { userRoles: { isRegularUser: true } },
        take,
        skip,
      };
      switch (sortby) {
        case 'email':
          options.order = { email: 'ASC' };
        case 'userName':
          options.order = { userName: 'ASC' };
        default:
          break;
      }
      return await this.userRepository.find(options);
    } catch (e) {
      if (e instanceof Error) console.error(`getAllRegularUsers: ${e.message}`);
    }
  }

  public async createRegularUser(data: CreateRegularUserDto): Promise<User> {
    try {
      const userByEmail = await this.getByEmail(data.email);
      const isEmailRegistered =
        userByEmail && userByEmail.userRoles.isRegularUser;
      if (isEmailRegistered) {
        throw new HttpException(
          `user by email ${data.email} is already Regular user!`,
          HttpStatus.BAD_REQUEST,
        );
      }
      const user = userByEmail ?? new User();
      if (!user.userRoles) {
        user.userRoles = new UserRoles();
      }
      user.userRoles.isRegularUser = true;
      user.email = data.email;
      user.userName = data.userName;
      await this.userRepository.save(user);

      const code = await this.prepareUserRegularProfileActivationCode(
        data.email,
      );
      this.emailService.sendActivationCode(data.email, code);

      await this.createRegularUserCreds(data.plainPassword, data.email, user);

      return user;
    } catch (e) {
      if (e instanceof Error) console.error(`createRegularUser: ${e.message}`);
      throw e;
    }
  }

  public async createAdminUser(data: CreateAdminUserDto): Promise<User> {
    try {
      const userByEmail = await this.getByEmail(data.email);
      const isEmailRegistered =
        userByEmail != null && userByEmail.userRoles.isAdminUser;
      if (isEmailRegistered) {
        throw new Error(`user by email ${data.email} is already admin!`);
      }
      const user = userByEmail ?? new User();
      if (!user.userRoles) {
        user.userRoles = new UserRoles();
      }
      user.userRoles.isAdminUser = true;
      user.email = data.email;
      await this.userRepository.save(user);
      await this.createAdminUserCredentials(
        data.plainPassword,
        data.email,
        user,
      );
      return user;
    } catch (e) {
      if (e instanceof Error) console.error(`createAdminUser: ${e.message}`);
      throw e;
    }
  }

  public async getById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  public async getByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  public async activateRegularUserProfile(
    activationCode: string,
  ): Promise<void> {
    try {
      const activation = await this.regularUserActivationCodeRepository.findOne(
        {
          where: { confirmationCode: activationCode },
        },
      );
      if (!activation) {
        throw new HttpException(
          `not found by code ${activationCode}`,
          HttpStatus.NOT_FOUND,
        );
      }
      const email = activation.email;
      const user = await this.getByEmail(email);
      if (!user) {
        throw new HttpException(`user is not found!`, HttpStatus.NOT_FOUND);
      }
      user.isProfileActivated = true;
      await this.userRepository.save(user);
      this.regularUserActivationCodeRepository.delete(activation);
    } catch (e) {
      if (e instanceof Error) console.error(`getByEmail: ${e.message}`);
      throw e;
    }
  }

  public async getAdminUserCreds(
    email: string,
  ): Promise<AdminUserCredentials | null> {
    console.log({ email });
    return await this.adminUserCredentialsRepository.findOne({
      where: { email },
    });
  }

  public async getRegularUserCreds(
    email: string,
  ): Promise<AdminUserCredentials | null> {
    return await this.regularUserCredentialsRepository.findOne({
      where: { email },
    });
  }

  // public requireOneMoreActivationCode(email: string) {
  // }

  // --------------------- private methods ---------------------

  private async createRegularUserCreds(
    password: string,
    email: string,
    user: User,
  ) {
    const newCred = new RegularUserCredentials();
    newCred.email = email;
    newCred.user = Promise.resolve(user);
    newCred.hashedPassword = await hash(password, 10);
    await this.regularUserCredentialsRepository.save(newCred);
  }

  private async createAdminUserCredentials(
    plainPassword: string | undefined,
    email: string,
    user: User,
  ) {
    if (!plainPassword) {
      plainPassword = uuidv4();
      console.log(`password was not provided, generated: ${plainPassword}`);
    }
    const newCred = new AdminUserCredentials();
    newCred.email = email;
    newCred.user = Promise.resolve(user);
    newCred.hashedPassword = await hash(plainPassword, 10);
    await this.adminUserCredentialsRepository.save(newCred);
  }

  private async prepareUserRegularProfileActivationCode(
    email: string,
  ): Promise<string> {
    const codeAsString = uuidv4();
    const newActivation = new RegularUserActivationCode();
    newActivation.confirmationCode = codeAsString;
    newActivation.email = email;
    await this.regularUserActivationCodeRepository.save(newActivation);
    return codeAsString;
  }
}
