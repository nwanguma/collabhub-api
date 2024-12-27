import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Skill } from '../../skills/entities/skill.entity';
import { Project } from '../../projects/entities/project.entity';
import { Follower } from '../../followers/entities/follower.entity';
import {
  Language,
  ProfileStatus,
  VisibilityStatus,
} from '../profiles.constants';
import { Comment } from '../../comments/entities/comment.entity';
import { Reaction } from '../../reactions/entities/reaction.entity';
import { Activity } from '../../activities/entitites/activity.entity';
import { Feedback } from '../../feedback/entities/feedback.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()' })
  @Generated('uuid')
  uuid: string;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  user_uuid: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  first_name: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  last_name: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  heading: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  bio: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  website: string;

  @Column({ type: 'varchar', nullable: true })
  linkedin: string;

  @Column({ type: 'varchar', nullable: true })
  github: string;

  @Column({ type: 'varchar', nullable: true })
  resume: string;

  @Column({ type: 'boolean', nullable: true })
  is_mentor: boolean;

  @Column({ type: 'varchar', nullable: true })
  mentor_note: string;

  @Column({ type: 'enum', enum: ProfileStatus, nullable: true })
  status: ProfileStatus;

  @Column({
    type: 'enum',
    enum: Language,
    array: true,
    nullable: true,
  })
  languages: Language[];

  @OneToMany(() => Follower, (follower) => follower.user)
  followers: Follower[];

  @OneToMany(() => Follower, (follower) => follower.follower)
  following: Follower[];

  @Column({ nullable: true })
  views: number;

  @ManyToMany(() => Skill, (skill) => skill.profiles)
  skills: Skill[];

  @OneToMany(() => Project, (project) => project.owner)
  projects: Project[];

  @ManyToMany(() => Project, (project) => project.collaborators)
  guest_projects: Project[];

  @Column({
    type: 'enum',
    enum: VisibilityStatus,
    default: VisibilityStatus.PUBLIC,
  })
  visibility_status: VisibilityStatus;

  // Profile that gave the feedback
  @OneToMany(() => Feedback, (feedback) => feedback.owner)
  owned_feedbacks: Feedback[];

  //Initiated the activity
  @OneToMany(() => Activity, (activity) => activity.owner)
  owned_activities: Activity[];

  //Second party in the activity
  @OneToMany(() => Activity, (activity) => activity.participant)
  participant_activities: Activity[];

  //Comments on the user's profile
  @OneToMany(() => Comment, (comment) => comment.profile)
  profile_comments: Comment[];

  //Comments created by the user on other entities
  @OneToMany(() => Comment, (comment) => comment.owner)
  owned_comments: Comment[];

  //Reactions on the user's profile
  @OneToMany(() => Reaction, (reaction) => reaction.profile)
  profile_reactions: Reaction[];

  //Reactions created by the user on other entities
  @OneToMany(() => Comment, (comment) => comment.owner)
  owned_reactions: Comment[];

  @OneToMany(() => Activity, (activity) => activity.profile)
  activities: Activity[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
