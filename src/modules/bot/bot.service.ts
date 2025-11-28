import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { ChatGateway } from '../chat/chat.gateway';
import { extractId } from 'src/common/helpers/extracter-id';

@Injectable()
export class BotService implements OnModuleDestroy {
  private readonly logger = new Logger(BotService.name);
  private bot?: Telegraf;
  private targetChatId?: string;

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  async initBot() {
    const token =
      this.configService.get<string>('TELEGRAM_BOT_TOKEN') ||
      process.env.TELEGRAM_BOT_TOKEN;
    this.targetChatId =
      this.configService.get<string>('TELEGRAM_TARGET_CHAT_ID') ||
      process.env.TELEGRAM_TARGET_CHAT_ID;

    if (!token) {
      this.logger.warn(
        'TELEGRAM_BOT_TOKEN is not set; Telegram bot is disabled',
      );
      return;
    }

    this.bot = new Telegraf(token);

    this.bot.start(async (ctx) => {
      const fromId = String(ctx.update.message.from.id);
      const targetId = String(this.targetChatId ?? '');
      if (!targetId || fromId === targetId) {
        await ctx.reply('✅ Bot is running');
        return;
      }
      await ctx.reply('❌ You are not authorized to use this bot.');
    });

    this.bot.on('text', async (ctx) => {
      const messageText = ctx.message.text;

      const repliedMessage = ctx.message.reply_to_message;

      if (!repliedMessage || !('text' in repliedMessage)) {
        this.logger.log('No replied text message found');
        await ctx.reply(
          "Muroja'tga javob berish uchun habarni belgilashni unutmang!!!",
        );

        return;
      }

      const originalText = repliedMessage.text;

      this.logger.log(`Original message (replied to): ${originalText}`);

      const id = extractId(originalText);
      if (!id) {
        this.logger.log(`ID was not found from original message`);
        return;
      }

      const from = ctx.from.username || ctx.from.first_name;

      this.chatGateway.sendMessageToClient(id, messageText);

      this.logger.log(`Message from ${from}: ${messageText}`);
    });
  }

  async launch() {
    if (!this.bot) return;
    await this.bot.launch();
    this.logger.log('🚀 Telegram bot started (long polling)');
  }

  async onModuleDestroy() {
    if (this.bot) {
      await this.bot.stop('SIGTERM');
      this.logger.log('Telegram bot stopped');
    }
  }

  async sendToTarget(text: string) {
    if (!this.bot || !this.targetChatId) return;
    try {
      await this.bot.telegram.sendMessage(this.targetChatId, text, {
        parse_mode: 'HTML',
      } as any);
    } catch (err) {
      this.logger.error('Failed to send message to target chat', err as Error);
    }
  }
}
