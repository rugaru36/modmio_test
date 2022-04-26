import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('regular_user_credentials')
export class RegularUserCredentials {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public hashedPassword: string;

  @Column({ unique: true })
  public email: string;

  @OneToOne(() => User)
  @JoinColumn()
  public user: Promise<User>;

  @CreateDateColumn({ type: 'timestamp' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  public updatedAt!: Date;
}
