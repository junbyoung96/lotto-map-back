import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository , EntityManager } from 'typeorm';
import { LottoStore } from './entities/lotto-store.entity';
import { WinningInfo } from './entities/winning-info.entity';
import { WinningInfo as IWinningInfo, Store } from '../scheduler/web-crawler.service';
import { PagingDTO, RequestDto } from './dto/lotto-store.dto';
import { LottoStoreRanking } from './entities/lotto-store-ranking.entity';
@Injectable()
export class LottoService {
  constructor(
    @InjectRepository(LottoStore)
    private lottoRepository: Repository<LottoStore>,
    @InjectRepository(WinningInfo)
    private winningInfoRepository: Repository<WinningInfo>,
    @InjectRepository(LottoStoreRanking)
    private lottoStoreRankingRepository: Repository<LottoStoreRanking>,
    private entityManager: EntityManager,
  ) { }

  //특정좌표의 주변 판매점정보 가져오기
  getNearbyStores({ northEastLat, northEastLon, southWestLat, southWestLon }: RequestDto) {
    return this.lottoStoreRankingRepository
      .createQueryBuilder('store')
      .where('store.lat BETWEEN :southWestLat AND :northEastLat', { southWestLat, northEastLat })
      .andWhere('store.lon BETWEEN :southWestLon AND :northEastLon', { southWestLon, northEastLon })
      .orderBy('store.score', 'DESC')
      .limit(30)
      .getMany();
  }

  async getStoreList({ page, showCount, searchType, searchWord }: PagingDTO) {
    const storesQuery = this.lottoStoreRankingRepository
      .createQueryBuilder('store')
      .orderBy({ 'store.score': 'DESC' })
      .skip((page - 1) * showCount)
      .take(showCount);
    const totalCountQuery = this.lottoStoreRankingRepository
      .createQueryBuilder('store')
      .select('COUNT(*)', "totalCount");

    if (searchType && searchWord) {
      storesQuery.where(`store.${searchType} LIKE :searchWord`, { searchWord: `%${searchWord}%` });
      totalCountQuery.where(`store.${searchType} LIKE :searchWord`, { searchWord: `%${searchWord}%` });
    }

    const lottoStores = await storesQuery.getMany();
    const { totalCount } = await totalCountQuery.getRawOne();

    return { lottoStores, totalCount };
  }
  //전국판매점 정보
  getAllStores() {
    return this.lottoStoreRankingRepository.find();
  }
  //특정판매점의 상세정보 가져오기, 판매점정보, 당첨횟수, 당첨내역..
  async getStore(id: number) {
    const store = await this.lottoStoreRankingRepository
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
  //판매점 저장하기
  async saveStores(stores: Store[]) {        
    await this.lottoRepository
      .createQueryBuilder()
      .insert()
      .into(LottoStore)
      .values(stores)
      .execute();
  }
  //판매점 삭제하기
  async deleteStore(storeIds: number[]) {
    await this.lottoRepository
      .createQueryBuilder()
      .delete()
      .from(LottoStore)
      .where("id IN (:...storeIds)", { storeIds })
      .execute();    
  }
  // 물리화된 뷰 갱신하기
  async refreshMaterializedView() {
    await this.entityManager.query('REFRESH MATERIALIZED VIEW lotto_store_ranking');
  }
}
