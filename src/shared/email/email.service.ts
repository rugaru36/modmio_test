import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';

@Injectable()
export class EmailService {
  @Inject(ConfigService)
  private readonly configService: ConfigService;

  async sendActivationCode(emailTo: string, code: string) {
    try {
      const body = {
        from_email: this.configService.get<string>('MAILOPOST_SENDER_EMAIL'),
        from_name: '___',
        to: emailTo,
        subject: 'Your profile activation link',
        text: `link is http://localhost:3000/user/activate/${code}`,
        html: `<h2>Confirm your email.</h2><h3>Your link is: <a>http://localhost:3000/user/activate/${code}</a></h3>`,
      };
      const apiUrl = this.configService.get<string>('MAILOPOST_API_URL');
      const apiKey = this.configService.get<string>('MAILOPOST_API_KEY');
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      };
      await axios.post(apiUrl, body, config);
    } catch (e) {
      e instanceof Error ? console.error(e.message) : console.error(e);
    }
  }
}
