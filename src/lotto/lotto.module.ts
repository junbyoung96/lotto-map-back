import { Module } from '@nestjs/common';
import { LottoService } from './lotto.service';
import { LottoController } from './lotto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LottoStore } from './entities/lotto-store.entity';
import { WinningInfo } from './entities/winning-info.entity';
import { LottoStoreRanking } from './entities/lotto-store-ranking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LottoStore, WinningInfo, LottoStoreRanking])],
  controllers: [LottoController],
  providers: [LottoService],
  exports: [LottoService]
})
export class LottoModule { }
