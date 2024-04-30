import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { LottoService } from './lotto.service';
import { RequestDto } from './dto/request.dto';

@Controller('lotto-stores')
export class LottoController {
  constructor(private readonly lottoService: LottoService) { }

  @Post()
  @HttpCode(HttpStatus.OK)
  findStoresNearLocation(@Body() requestDto: RequestDto) {
    return this.lottoService.getNearbyStores(requestDto);
  }

  @Get()
  findAllStores() {
    return this.lottoService.getAllStores();
  }

  @Get('/:id')
  findStore(@Param('id') id: string) {
    return this.lottoService.getStore(+id);
  }
}
