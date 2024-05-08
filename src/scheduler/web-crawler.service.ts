import { Injectable, Logger } from '@nestjs/common';
import axios from "axios";
import * as cheerio from "cheerio";
import * as iconv from "iconv-lite";

export interface Store {
    id: number,
    name: string,
    tel: string,
    address: string,
    latitude: number,
    longitude: number
}

export interface WinningInfo {
    store_id: number,
    draw_no: number,
    rank: number,
    category: string
}

@Injectable()
export class WebCrawlerService {
    private readonly logger = new Logger(WebCrawlerService.name);

    async getStoresByLocation(location: string): Promise<Store[]> {
        try {
            const encodedLocation = encodeURIComponent(location);
            const baseUrl = `https://dhlottery.co.kr/store.do?method=sellerInfo645Result&searchType=1&sltSIDO=${encodedLocation}&rtlrSttus=001`;
            const initialUrl = `${baseUrl}&nowPage=1`;
            const response = await axios.get(initialUrl, { responseType: 'arraybuffer', responseEncoding: 'binary' });
            const data = iconv.decode(response.data, 'EUC-KR');
            const jsonData = JSON.parse(data);
            const stores: Store[] = [];

            for (let i = 1; i <= jsonData.totalPage; i++) {
                const pageUrl = `${baseUrl}&nowPage=${i}`;
                const pageResponse = await axios.get(pageUrl, { responseType: 'arraybuffer', responseEncoding: 'binary' });
                let storeData = iconv.decode(pageResponse.data, 'EUC-KR');
                storeData = storeData.replace(/&&#35;40;/g, '(').replace(/&&#35;41;/g, ')');
                const jsonStoreData = JSON.parse(storeData);
                jsonStoreData.arr.forEach(store => {
                    const a: Store = {
                        id: store.RTLRID,
                        name: store.FIRMNM,
                        tel: store.RTLRSTRTELNO,
                        address: store.BPLCDORODTLADRES,
                        latitude: store.LATITUDE,
                        longitude: store.LONGITUDE,
                    }
                    stores.push(a);
                });
            }
            return stores;
        } catch (error) {
            this.logger.error('Error retrieving stores by location', error);
            return [];
        }
    }

    async getWinningInfo(drwNo: number) {
        try {
            let regex: RegExp;
            let match: RegExpExecArray | null;

            const response = await axios({
                method: 'post',
                url: `https://dhlottery.co.kr/store.do?method=topStore&pageGubun=L645&nowPage=1&drwNo=${drwNo}&schKey=all`,
                responseType: 'arraybuffer',
                responseEncoding: 'binary',
            });
            const html = iconv.decode(response.data, 'EUC-KR');
            const $ = cheerio.load(html);
            const aTagCount = $("#page_box").children().length;
                                          
            if(aTagCount === 0){
                return [];
            }
            let totalPage = aTagCount > 10 ? parseInt($("#page_box .end").attr("onclick").match(/\d+/)[0]) : aTagCount;

            const results: WinningInfo[] = [];
            // 1등 배출점 저장
            $(".tbl_data_col").eq(0).find("tbody").children().each((i, e) => {
                const category = $(e).find("td").eq(2).text().includes("자동") ? "자동" : "수동";
                const storeId = $(e).find("td").eq(4).find("a").attr("onclick").match(/\d+/)[0];

                if (storeId) {
                    const info: WinningInfo = {
                        store_id: Number(storeId),
                        draw_no: drwNo,
                        rank: 1,
                        category: category,
                    }
                    results.push(info);
                }
            });

            // 2등 배출점 저장
            for (let i = 1; i <= totalPage; i++) {
                const pageResponse = await axios({
                    method: 'post',
                    url: `https://dhlottery.co.kr/store.do?method=topStore&pageGubun=L645&nowPage=${i}&drwNo=${drwNo}&schKey=all`,
                    responseType: 'arraybuffer',
                    responseEncoding: 'binary',
                });
                const pageHtml = iconv.decode(pageResponse.data, 'EUC-KR');
                const $page = cheerio.load(pageHtml);

                $page(".tbl_data_col").eq(1).find("tbody").children().each((i, e) => {
                    const storeId = $page(e).find("td").eq(3).find("a").attr("onclick").match(/\d+/)[0];
                    if (storeId) {
                        const info: WinningInfo = {
                            store_id: Number(storeId),
                            draw_no: drwNo,
                            rank: 2,
                            category: null
                        }
                        results.push(info);
                    }
                });
            }

            return results;
        } catch (error) {
            this.logger.error(`${drwNo}회차 당첨내역 크롤링중 에러발생`, error);
            return [];
        }
    }
}
