import { User } from '../users/entities/user.entity';
import { Message } from '../messages/entities/message.entity';

export interface ParticipantsData {
  participants: {
    user: User;
    participant: User;
  };
  latest_message: Message;
  id: string;
}
