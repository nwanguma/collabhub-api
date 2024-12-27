import { IsNotEmpty, IsEnum } from 'class-validator';
import { ActivityTypes } from '../activities.constants';

export class CreateActivityDto {
  @IsNotEmpty()
  @IsEnum(ActivityTypes)
  type: ActivityTypes;
}
