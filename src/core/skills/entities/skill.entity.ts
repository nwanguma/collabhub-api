import {
  Entity,
  Column,
  ManyToMany,
  PrimaryGeneratedColumn,
  JoinTable,
} from 'typeorm';

import { Profile } from '../../profiles/entities/profile.entity';
import { Project } from '../../projects/entities/project.entity';
import { SkillType } from '../skills.constants';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  title: string;

  @ManyToMany(() => Profile, (profile) => profile.skills, {
    onDelete: 'SET NULL',
  })
  @JoinTable({
    name: 'profiles_skills',
    joinColumn: {
      name: 'skill_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'profile_id',
      referencedColumnName: 'id',
    },
  })
  profiles: Profile[];

  @ManyToMany(() => Project, (project) => project.skills)
  @JoinTable({
    name: 'projects_skills',
    joinColumn: {
      name: 'skill_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'project_id',
      referencedColumnName: 'id',
    },
  })
  projects: Project[];

  @Column({
    type: 'enum',
    enum: SkillType,
  })
  type: SkillType;
}
