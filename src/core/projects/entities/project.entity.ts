import {
  Entity,
  Column,
  ManyToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
  Generated,
} from 'typeorm';

import { Profile } from '../../profiles/entities/profile.entity';
import { Skill } from '../../skills/entities/skill.entity';
import { Reaction } from '../../reactions/entities/reaction.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Activity } from '../../activities/entitites/activity.entity';
import { Feedback } from '../../feedback/entities/feedback.entity';
import { ProjectStatus } from '../projects.constants';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()' })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 2000, nullable: false })
  description: string;

  @ManyToOne(() => Profile, (profile) => profile.projects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  owner: Profile;

  @ManyToMany(() => Profile, (profile) => profile.guest_projects)
  @JoinTable({
    name: 'profiles_projects',
    joinColumn: {
      name: 'project_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'profile_id',
      referencedColumnName: 'id',
    },
  })
  collaborators: Profile[];

  @Column({ type: 'boolean', nullable: true })
  requires_feedback: boolean;

  @Column({ type: 'varchar', nullable: true })
  feedback_guide: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  website: string;

  @Column({ type: 'varchar', nullable: true })
  github_url: string;

  @Column({ type: 'varchar', nullable: true })
  attachment: string;

  @ManyToMany(() => Skill, (skill) => skill.projects)
  skills: Skill[];

  @Column({ type: 'timestamptz', nullable: true })
  start_date: Date;

  @Column({ type: 'enum', enum: ProjectStatus, nullable: true })
  status: ProjectStatus;

  @Column({ nullable: true })
  views: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToMany(() => Feedback, (feedback) => feedback.project)
  feedbacks: Feedback[];

  @OneToMany(() => Comment, (comment) => comment.project)
  comments: Comment[];

  @OneToMany(() => Reaction, (reaction) => reaction.project)
  reactions: Reaction[];

  @OneToMany(() => Activity, (activity) => activity.project)
  activities: Activity[];
}
