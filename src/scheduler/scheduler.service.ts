import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { LottoService } from "src/lotto/lotto.service";
import { findStoreChanges, WebCrawlerService } from "./web-crawler.service";
@Injectable()
export class ScheduleService {
    private readonly logger = new Logger(ScheduleService.name);
    constructor(private readonly lottoService: LottoService, private readonly webCrawlerService: WebCrawlerService) { }

    @Cron('0 2 * * 0')   //매주 일요일 02시 00분 에 실행되는 스케줄러
    async schedule() {
        await this.updateStoreInfo();
        await this.saveWinningInfo();
        await this.lottoService.refreshMaterializedView();
    }

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

        this.logger.log('신규 당첨내역 등록 스케줄러 완료');
    }

    async updateStoreInfo() {
        try {
            const oldStores = await this.lottoService.getAllStores(); //기존 판매점정보
            const newStores = await this.webCrawlerService.getNewStores();//신규 판매점정보
            const { newOpenedStores, closedStores } = findStoreChanges(oldStores, newStores);
            if (newOpenedStores.length == 0 && closedStores.length == 0) {
                this.logger.log('업데이트할 판매점이 없습니다.');
            } else {
                await this.lottoService.saveStores(newOpenedStores); //개점한 판매점 등록
                await this.lottoService.deleteStore(closedStores); //폐점한 판매점 삭제  
            }
        } catch (err) {
            this.logger.log(err);
        }
        this.logger.log('판매점 업데이트 스케줄러 완료');

    }
}