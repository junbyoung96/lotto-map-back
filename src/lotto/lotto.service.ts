import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestDto } from './dto/request.dto';
import { LottoStore } from './entities/lotto-store.entity';
import { WinningInfo } from './entities/winning-info.entity';
import { WinningInfo as IWinningInfo } from '../scheduler/web-crawler.service';
@Injectable()
  export class LottoService {
    constructor(
      @InjectRepository(LottoStore)
      private lottoRepository: Repository<LottoStore>,
      @InjectRepository(WinningInfo)
      private winningInfoRepository: Repository<WinningInfo>,
    ) { }

    //특정좌표의 주변 판매점정보 가져오기
    getNearbyStores({ northEastLat, northEastLon, southWestLat, southWestLon }: RequestDto) {
      return this.lottoRepository
        .createQueryBuilder('store')
        .where('store.lat BETWEEN :southWestLat AND :northEastLat', { southWestLat, northEastLat })
        .andWhere('store.lon BETWEEN :southWestLon AND :northEastLon', { southWestLon, northEastLon })
        .orderBy('store.score', 'DESC')
        .limit(30)
        .getMany();
    }
    //전국판매점 정보
    getAllStores() {
      return this.lottoRepository.find();
    }
    //특정판매점의 상세정보 가져오기, 판매점정보, 당첨횟수, 당첨내역..
    async getStore(id: number) {
      const store = await this.lottoRepository
        .createQueryBuilder('store')
        .select()
        .where('store.id = :id', { id }) // 동적으로 전달받은 store_id 사용
        .getOne();
      store.winningInfo = await this.winningInfoRepository
        .createQueryBuilder('wi')
        .select()
        .where('wi.store_id = :id', { id })
        .getMany();

      return store;
    }
    //저장된 회차중 가장 높은 회차 가져오기
    async getLastDraw_no() {
      return await this.winningInfoRepository
        .createQueryBuilder('wi')
        .select("MAX(wi.draw_no)", "maxDrawNo")
        .getRawOne();
    }

    //당첨내역 저장하기
    async saveWinningInfo({ store_id, draw_no, rank, category }: IWinningInfo) {
      await this.winningInfoRepository
        .createQueryBuilder()
        .insert()
        .into(WinningInfo)
        .values({
          store_id,
          draw_no,
          rank,
          category,
        })
        .execute();
    }
  }
