import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { LottoService } from "src/lotto/lotto.service";
import { WebCrawlerService } from "./web-crawler.service";

@Injectable()
export class ScheduleService {
    private readonly logger = new Logger(ScheduleService.name);
    constructor(private readonly lottoService: LottoService, private readonly webCrawlerService: WebCrawlerService) { }

    //@Cron('0 2 * * 1')   //매주 월요일 02시 00분 에 실행되는 스케줄러
    async saveWinningInfo() { 
        let { maxDrawNo } = await this.lottoService.getLastDraw_no(); //db에 저장된 가장높은 회차번호 가져오기.        
        while (true) {
            this.logger.log(`${maxDrawNo + 1} 회차 크롤링 시작`);
            const results = await this.webCrawlerService.getWinningInfo(++maxDrawNo);
            if (results.length === 0) {
                break;
            }
            for (const result of results) {
                try {
                    await this.lottoService.saveWinningInfo(result);
                } catch (err) {
                    this.logger.log(err);
                }
            }
        }
        this.logger.log('당첨내역 스케줄러 완료');
    }
}