import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAdminUserAuthGuard extends AuthGuard('admin-user') {}
