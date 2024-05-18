import { OneToMany, ViewColumn, ViewEntity } from 'typeorm';
import { WinningInfo } from './winning-info.entity';

@ViewEntity({
  name: 'lotto_store_ranking',
  expression: `
    SELECT 
        ls.id,
        ls."name",
        ls.phone,
        ls.address,
        ls.lat,
        ls.lon,
        COUNT(CASE WHEN wi."rank" = 1 THEN 1 END) AS first_prize,
        COUNT(CASE WHEN wi."rank" = 2 THEN 1 END) AS second_prize,
        COUNT(CASE WHEN wi."rank" = 1 THEN 1 END) * 40 + COUNT(CASE WHEN wi."rank" = 2 THEN 1 END) AS score
    FROM 
        public.lotto_stores ls
    LEFT JOIN 
        public.winning_info wi 
    ON 
        ls.id = wi.store_id
    GROUP BY 
        ls.id
    ORDER BY
        score DESC
  `,
})
export class LottoStoreRanking {
  @ViewColumn()
  id: number;

  @ViewColumn()
  name: string;

  @ViewColumn()
  phone: string;

  @ViewColumn()
  address: string;

  @ViewColumn()
  lat: number;

  @ViewColumn()
  lon: number;

  @ViewColumn()
  first_prize: number;

  @ViewColumn()
  second_prize: number;

  @ViewColumn()
  score: number;
  @OneToMany(() => WinningInfo, winningInfo => winningInfo.store)
  winningInfo: WinningInfo[];
}
