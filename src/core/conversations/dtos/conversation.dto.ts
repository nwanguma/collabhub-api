import { Expose, Type } from 'class-transformer';
import { MessageDto } from '../../messages/dtos/message.dto';
import { UserDto } from '../../users/dtos/user.dto';

class ParticipantsDto {
  @Type(() => UserDto)
  @Expose()
  user: UserDto;

  @Type(() => UserDto)
  @Expose()
  participant: UserDto;
}

export class ConversationDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => ParticipantsDto)
  participants: ParticipantsDto;

  @Expose()
  @Type(() => MessageDto)
  latest_message: MessageDto;

  @Expose()
  created_at?: Date;
}
