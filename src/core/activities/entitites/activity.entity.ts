import {
  Column,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Project } from '../../projects/entities/project.entity';
import { Profile } from '../../profiles/entities/profile.entity';
import { ActivityTypes } from '../activities.constants';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()' })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'enum', enum: ActivityTypes })
  type: ActivityTypes;

  @ManyToOne(() => Profile, (profile) => profile.owned_activities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'owner_id' })
  owner: Profile;

  @ManyToOne(() => Profile, (profile) => profile.participant_activities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'participant_id' })
  participant: Profile;

  @ManyToOne(() => Project, (project) => project.activities, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => Profile, (profile) => profile.activities, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;
}
