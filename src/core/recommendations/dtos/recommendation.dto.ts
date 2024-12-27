import { Expose, Type } from 'class-transformer';
import { IsArray } from 'class-validator';

import { LimitedProfileDto } from '../../profiles/dtos/profile.dto';
import { LimitedProjectDto } from '../../projects/dtos/project.dto';

export class RecommendationDto {
  @Expose()
  @Type(() => LimitedProfileDto)
  @IsArray()
  profilesToFollow: LimitedProfileDto;

  @Expose()
  @Type(() => LimitedProfileDto)
  @IsArray()
  profiles: LimitedProfileDto;

  @Expose()
  @Type(() => LimitedProjectDto)
  @IsArray()
  projects: LimitedProjectDto;
}
