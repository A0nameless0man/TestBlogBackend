import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { AutoEntity } from './auto.entity';
import User from './user.entity';

@Entity()
class Article extends AutoEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne((_) => User)
  @JoinColumn()
  user: User;
  @Column()
  title: string
  @Column({ select: false })
  content: string
}

export default Article;
