import {
  Entity,
  PrimaryGeneratedColumn,
  Generated,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Conversation } from '../../conversations/entities/conversation.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()' })
  @Generated('uuid')
  uuid: string;

  @Column()
  text: string;

  @ManyToOne(() => User, (user) => user.sent_messages)
  sender: User;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @Column({ default: false })
  is_read: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
