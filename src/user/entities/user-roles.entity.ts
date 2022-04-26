import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_roles')
export class UserRoles {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: false, default: false })
  public isAdminUser: boolean;

  @Column({ nullable: false, default: false })
  public isRegularUser: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  public createdAt!: Date;

  @OneToOne(() => User, (type) => type.userRoles)
  public user: Promise<User>;

  @UpdateDateColumn({ type: 'timestamp' })
  public updatedAt!: Date;
}
