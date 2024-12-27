import { Expose, Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber } from 'class-validator';

import {
  CommentDto,
  LimitedCommentDto,
} from './../../comments/dtos/comment.dto';
import { LimitedProfileDto } from './../../profiles/dtos/profile.dto';
import { SkillDto } from '../../../core/skills/dtos/skill.dto';
import {
  LimitedReactionDto,
  ReactionDto,
} from '../../../core/reactions/dtos/reaction.dto';
import { FeedbackDto } from '../../feedback/dtos/feedback.dto';
import { ProjectStatus } from '../projects.constants';

export class ProjectDto {
  @Expose()
  @Transform(({ obj }) => obj.uuid)
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  website: string;

  @Expose()
  github_url: string;

  @Expose()
  attachment: string;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;

  @Expose()
  start_date: Date;

  @Expose()
  requires_feedback: boolean;

  @Expose()
  feedback_guide: string;

  @Expose()
  @IsArray()
  @Type(() => FeedbackDto)
  feedbacks: FeedbackDto[];

  @Expose()
  location: string;

  @Expose()
  views: string;

  @Expose()
  @IsEnum(ProjectStatus)
  status: ProjectStatus;

  @Expose()
  @IsArray()
  @Type(() => SkillDto)
  skills: SkillDto[];

  @Expose()
  @IsArray()
  @Type(() => CommentDto)
  comments: CommentDto[];

  @Expose()
  @IsArray()
  @Type(() => ReactionDto)
  reactions: ReactionDto[];

  @Expose()
  @Type(() => LimitedProfileDto)
  owner: LimitedProfileDto;

  @Expose()
  @IsArray()
  @Type(() => LimitedProfileDto)
  collaborators: LimitedProfileDto[];
}

export class PaginatedProjectDto {
  @Expose()
  @IsArray()
  @Type(() => ProjectDto)
  data: ProjectDto[];

  @Expose()
  @IsNumber()
  total: number;

  @Expose()
  @IsNumber()
  totalPages: number;

  @Expose()
  @IsNumber()
  page: number;

  @Expose()
  @IsNumber()
  perPage: number;
}

export class LimitedProjectDto {
  @Expose()
  @Transform(({ obj }) => obj.uuid)
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  website: string;

  @Expose()
  github_url: string;

  @Expose()
  @IsEnum(ProjectStatus)
  status: ProjectStatus;

  @Expose()
  requires_feedback?: Date;

  @Expose()
  @IsArray()
  @Type(() => SkillDto)
  skills: SkillDto[];

  @Expose()
  @Transform(({ obj }) => obj.collaborators?.map((c) => c.uuid))
  @Type(() => LimitedCommentDto)
  collaborators: LimitedProfileDto[];

  @Expose()
  @IsArray()
  @Type(() => LimitedCommentDto)
  comments: LimitedCommentDto[];

  @Expose()
  @IsArray()
  @Type(() => LimitedReactionDto)
  reactions: LimitedReactionDto[];

  @Expose()
  created_at: Date;
}

export class PaginatedLimitedProjectDto {
  @Expose()
  @IsArray()
  @Type(() => LimitedProjectDto)
  data: LimitedProjectDto[];

  @Expose()
  @IsNumber()
  total: number;

  @Expose()
  @IsNumber()
  totalPages: number;

  @Expose()
  @IsNumber()
  page: number;

  @Expose()
  @IsNumber()
  perPage: number;
}
