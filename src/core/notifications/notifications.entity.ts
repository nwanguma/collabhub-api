import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';

import { User } from '../users/entities/user.entity';
import {
  NotificationTypes,
  NotificationCategories,
} from './notifications.constant';
import { ResourceTypes } from '../../common/constants/index.constants';
import { Profile } from '../profiles/entities/profile.entity';
import { Project } from '../projects/entities/project.entity';
import { Message } from '../messages/entities/message.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()' })
  uuid: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  initiator: User;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  recipient: User;

  @Column({
    type: 'enum',
    enum: NotificationTypes,
    array: true,
  })
  type: NotificationTypes[];

  @Column({
    type: 'enum',
    enum: NotificationCategories,
  })
  category: NotificationCategories;

  @Column({ default: false })
  is_read: boolean;

  @Column({ type: 'varchar', nullable: true })
  content: string;

  @ManyToOne(() => Profile, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @ManyToOne(() => Project, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => Message, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @Column({
    type: 'enum',
    enum: ResourceTypes,
  })
  resource_type: ResourceTypes;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
