import { Module } from '@nestjs/common';
import { AppGateway } from './gateway';
import { MessagesModule } from '../../core/messages/messages.module';

@Module({
  imports: [MessagesModule],
  providers: [AppGateway],
})
export class AppGatewayModule {}
