import { Expose, Type, Transform } from 'class-transformer';
import { UserDto } from '../../users/dtos/user.dto';
import { ConversationDto } from '../../../core/conversations/dtos/conversation.dto';

export class MessageDto {
  @Expose()
  @Transform(({ obj }) => obj.uuid)
  id: number;

  @Expose()
  text: string;

  @Expose()
  @Type(() => UserDto)
  sender: UserDto;

  @Expose()
  @Type(() => ConversationDto)
  conversation: ConversationDto;

  @Expose()
  @Type(() => UserDto)
  receiver: UserDto;

  @Expose()
  is_read?: boolean;

  @Expose()
  created_at?: Date;

  @Expose()
  updated_at?: Date;
}
