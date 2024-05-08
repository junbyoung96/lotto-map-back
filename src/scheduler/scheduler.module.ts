import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LottoModule } from 'src/lotto/lotto.module';
import { ScheduleService } from './scheduler.service';
import { WebCrawlerService } from './web-crawler.service';

@Module({
    imports: [
        ScheduleModule.forRoot(),LottoModule
    ],
    providers: [ScheduleService,WebCrawlerService],
})
export class SchedulerModule {}
