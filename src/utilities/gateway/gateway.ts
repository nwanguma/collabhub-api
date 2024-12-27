// import { UseGuards } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { MessagesService } from '../../core/messages/messages.service';
import { CreateMessageDto } from '../../core/messages/dtos/create-message.dto';
// import { JwtAuthGuard } from '../../core/auth/guards/jwt.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer() server: Server;

  constructor(private readonly messagesService: MessagesService) {}

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(roomId);
    console.log(`Client ${client.id} joined room: ${roomId}`);
  }

  @SubscribeMessage('sendMessage')
  // @UseGuards(JwtAuthGuard)
  async handleSendMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.sendMessage(createMessageDto);
    console.log('Sending message:', message);

    // Emit the message to the specific room (conversation ID)
    this.server
      .to(createMessageDto.conversation_id)
      .emit('receiveMessage', message);
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  afterInit(server: Server) {
    console.log('WebSocket initialized');
  }
}
