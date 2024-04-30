import { Test, TestingModule } from '@nestjs/testing';
import { LottoController } from './lotto.controller';
import { LottoService } from './lotto.service';

describe('LottoController', () => {
  let controller: LottoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LottoController],
      providers: [LottoService],
    }).compile();

    controller = module.get<LottoController>(LottoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
