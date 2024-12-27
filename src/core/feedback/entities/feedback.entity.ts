import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Generated,
} from 'typeorm';

import { Profile } from '../../profiles/entities/profile.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity('feedbacks')
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()' })
  @Generated('uuid')
  uuid: string;

  @ManyToOne(() => Profile, (profile) => profile.owned_feedbacks, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'owner_id' })
  owner: Profile;

  @Column({ type: 'varchar' })
  guide: string;

  @Column({ type: 'varchar' })
  text: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => Project, (project) => project.feedbacks, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
