import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { AutoEntity } from './auto.entity';

@Entity()
@Unique(['username'])
class User extends AutoEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  username: string;
  @Column({ select: false })
  password: string;
}

export default User;
