import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalBaseUserAuthGuard extends AuthGuard('base-user') {}
