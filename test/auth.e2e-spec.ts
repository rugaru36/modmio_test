import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserModule } from '../src/user/user.module';
import { AuthModule } from '../src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from '../src/typeorm/typeorm.service';
import { ConfigModule } from '@nestjs/config';
import { getEnvPath } from '../src/common/helper/env.helper';
import { User } from '../src/user/entities/user.entity';
import { CreateRegularUserDto } from '../src/user/dto/create-regular-user.dto';

jest.useFakeTimers();

const jwtRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;

function getRandomString(length: number): string {
  let result = '';
  const characters = 'ABCDEFGHIJKLMTUVWXYZabcdefghijklmnopqrst123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

let app: INestApplication;

describe('AppController (e2e)', () => {
  jest.useFakeTimers();
  jest.setTimeout(10000);

  beforeAll(async () => {
    try {
      const envFilePath: string = getEnvPath(`${process.cwd()}/.env`);
      const moduleBulider: TestingModuleBuilder = Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({ envFilePath, isGlobal: true }),
          TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
          UserModule,
          AuthModule,
        ],
      });
      const module = await moduleBulider.compile();
      app = module.createNestApplication();
      await app.init();
    } catch (e) {
      if (e instanceof Error) console.error(`beforeAll ${e.message}`);
    }
  });

  afterAll(async () => {
    try {
      await app.close();
    } catch (e) {
      if (e instanceof Error) console.error(`afterAll: ${e.message}`);
    }
  });

  describe('Auth Module', () => {
    const regularEmail = 'qwe5@qwe.qwe';
    const regularPassword = 'rugaru314';
    let regularToken = String();

    const adminEmail = 'new@new.new';
    const adminPassword = '856a7a93-9f98-40d8-a5ca-aa149e827d5c';
    let adminToken = String();

    it('sign in for regular user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin/regular-user')
        .send({ email: regularEmail, password: regularPassword });
      regularToken = response.body.token;
      console.log({ regularToken });
      expect(regularToken).toMatch(jwtRegex);
      expect(response.body.user).toBeInstanceOf(Object);
      expect(response).toBe(HttpStatus.OK);
    });

    it('sign in for admin user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin/regular-user')
        .send({ email: adminEmail, password: adminPassword });

      adminToken = response.body.token;
      expect(adminToken).toMatch(jwtRegex);
      expect(response.body.user).toBeInstanceOf(User);
    });

    it('auth - admin user', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.body).toBeInstanceOf(User);
    });

    it('auth - regular user', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth')
        .set('Authorization', `Bearer ${regularToken}`);
      expect(response.body).toBeInstanceOf(User);
    });

    it('sign-up - regular user', async () => {
      const dto = new CreateRegularUserDto();
      dto.email = `${getRandomString(10)}@test.ru`;
      dto.plainPassword = getRandomString(10);
      dto.userName = getRandomString(5);
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(dto);
      expect(response.body.token).toMatch(jwtRegex);
    });

    it('admin - get all regular user', async () => {
      const take = 5;
      const skip = 0;
      const sortBy = 'email';
      const response = await request(app.getHttpServer())
        .get(`/all/regular?take=${take}&skip=${skip}&sortBy=${sortBy}`)
        .set('Authorization', `Bearer ${adminToken}`);
      // expect(response.body)
    });
  });
});
