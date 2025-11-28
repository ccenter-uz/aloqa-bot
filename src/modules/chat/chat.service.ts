import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { BotService } from '../bot/bot.service';
import { messageFormatter } from 'src/common/helpers/message-formatter';
import { MessageDto } from 'src/types/chat/message.dto';
@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @Inject(forwardRef(() => BotService))
    private readonly botService: BotService,
  ) {}

  async sendMessage(messageData: MessageDto) {
    this.logger.log(`Sending message: ${JSON.stringify(messageData)}`);
    try {
      await this.botService.sendToTarget(
        messageFormatter(messageData.id, messageData.message),
      );
    } catch (error) {
      this.logger.error(`Failed to send message: ${error}`);
      throw error;
    }
  }
}
