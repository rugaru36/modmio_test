import { Request } from 'express';
import { User } from '../../user/entities/user.entity';

export interface ReqWithUser extends Request {
  user: User;
}
