import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();

const configService = new ConfigService();

console.log(
  configService.get<string>('DATABASE_NAME'),
  configService.get<string>('DATABASE_URL'),
);

export const AppDataSource = new DataSource({
  type: 'postgres',
  database: configService.get<string>('DATABASE_NAME'),
  url: configService.get<string>('DATABASE_URL'),
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development',
  cache: {
    duration: 60000,
  },
  // logging: true,
});
