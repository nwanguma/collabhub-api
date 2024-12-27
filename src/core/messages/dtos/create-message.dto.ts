import { IsString, IsNotEmpty } from 'class-validator';

export class MessageDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  receiver_id: string;
}

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  receiver_id: string;

  @IsString()
  @IsNotEmpty()
  conversation_id: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}
