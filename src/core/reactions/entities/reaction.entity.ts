import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Generated,
  JoinColumn,
} from 'typeorm';

import { Profile } from '../../profiles/entities/profile.entity';
import { Project } from '../../projects/entities/project.entity';
import { ReactionType } from '../reaction.constants';

@Entity('reactions')
export class Reaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()' })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'enum', enum: ReactionType })
  type: ReactionType;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => Profile, (profile) => profile.owned_reactions, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'owner_id' })
  owner: Profile;

  @ManyToOne(() => Project, (project) => project.reactions, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => Profile, (profile) => profile.profile_reactions, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;
}
