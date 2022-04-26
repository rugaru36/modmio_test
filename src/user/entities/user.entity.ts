import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserRoles } from './user-roles.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ unique: true })
  public email: string;

  @Column({ nullable: false, default: false })
  public isProfileActivated: boolean;

  @Column({ default: String() })
  public userName: string;

  @OneToOne(() => UserRoles, (type) => type.user, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  public userRoles: UserRoles;

  @CreateDateColumn({ type: 'timestamp' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  public updatedAt!: Date;
}
