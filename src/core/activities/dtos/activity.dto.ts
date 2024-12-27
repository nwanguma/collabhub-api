import { IsNotEmpty, IsEnum } from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';

import { ActivityTypes } from '../activities.constants';
import { LimitedProfileDto } from '../../profiles/dtos/profile.dto';
import { LimitedProjectDto } from '../../projects/dtos/project.dto';

export class ActivityDto {
  @Transform(({ obj }) => obj.uuid)
  @IsNotEmpty()
  @Expose()
  id: string;

  @IsEnum(ActivityTypes)
  @IsNotEmpty()
  @Expose()
  type: ActivityTypes;

  @Type(() => LimitedProfileDto)
  @Expose()
  owner: LimitedProfileDto;

  @Type(() => LimitedProfileDto)
  @Expose()
  participant: LimitedProfileDto;

  @Type(() => LimitedProfileDto)
  @Expose()
  profile: LimitedProfileDto;

  @Type(() => LimitedProjectDto)
  @Expose()
  project: LimitedProjectDto;
}
