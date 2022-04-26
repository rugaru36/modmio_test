import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserService } from './user/user.service';
import 'module-alias/register';

async function bootstrap() {
  const application = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  });
  try {
    const command = process.argv[2];
    switch (command) {
      case 'create-administrator-user':
        const usersService = application.get(UserService);
        const newAdminEmail = process.argv[3];
        const newAdminPassword = process.argv[4];
        if (!newAdminEmail) throw new Error('no email!');
        await usersService.createAdminUser({
          email: newAdminEmail,
          plainPassword: newAdminPassword,
        });
        break;
      default:
        console.log('Command not found');
        process.exit(1);
    }
  } catch (e) {
    e instanceof Error ? console.error(e.message) : console.error(e);
  }

  await application.close();
  process.exit(0);
}

bootstrap();
