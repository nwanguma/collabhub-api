import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { CreateSkillDto } from '../../skills/dtos/create-skill.dto';
import { ProjectStatus } from '../projects.constants';

export class CreateOrUpdateProjectDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsBoolean()
  @IsOptional()
  requires_feedback?: boolean;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  feedback_guide?: string;

  @IsString()
  @IsOptional()
  attachment?: string;

  @IsString()
  @IsOptional()
  github_url?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsArray()
  @IsOptional()
  collaborators?: string[];

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @IsArray()
  @IsOptional()
  skills?: CreateSkillDto[];
}
