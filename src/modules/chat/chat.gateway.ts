import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // Разрешить подключение с любых доменов
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    client.emit('message', {
      text: `Salom! Savol yoki muroja'tingiz bo‘lsa, bemalol yozishingiz mumkin.`,
    });

    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Received message from ${client.id}:`, data);
    client.emit('message', {
      text: `Habaringiz qabul qilindi. Tez orada javob beramiz, iltimos, sahifani tark etmang.`,
    });
    this.chatService.sendMessage({ id: client.id, message: data });
  }

  sendMessageToClient(clientId: string, message: string) {
    const socket = this.server.sockets.sockets.get(clientId);

    if (socket) {
      socket.emit('message', { text: message });
    }
  }
}
