import * as process from 'process';
import * as dotenv from 'dotenv';
import { registerAs } from '@nestjs/config';
dotenv.config();

export const CONFIG_APP_TOKEN = process.env.CONFIG_APP_TOKEN || 'app';
export const CONFIG_MONGO_DB_TOKEN = process.env.CONFIG_MONGO_DB_TOKEN || 'db';
export const TELEGRAM_TARGET_CHAT_ID: number = Number(
  process.env.TELEGRAM_TARGET_CHAT_ID,
);
export const appConfig = registerAs(
  CONFIG_APP_TOKEN,
  (): AppConfig => ({
    host: process.env.APP_HOST || 'localhost',
    port: process.env.APP_PORT || '3000',
    cors_domains: (process.env.CORS_DOMAINS || 'http://localhost:3000').split(
      ',',
    ),
  }),
);

export const mongoDbConfig = registerAs(
  CONFIG_MONGO_DB_TOKEN,
  (): MongoDbConfig => ({
    url: process.env.MONGO_DB_URL || 'mongodb://localhost:27017/aloqa-bot',
  }),
);

export type AppConfig = {
  host: string;
  port: string;
  cors_domains: string[];
};

export type MongoDbConfig = {
  url: string;
};
