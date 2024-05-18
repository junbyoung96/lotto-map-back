import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { LottoModule } from './lotto/lotto.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [LottoModule,
    SchedulerModule, ConfigModule.forRoot({
      envFilePath: (process.env.NODE_ENV === 'production') ? path.join(__dirname, '..', 'config', 'product.env') : path.join(__dirname, '..', 'config', 'local.env')
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
    }),
  ],
})
export class AppModule { }