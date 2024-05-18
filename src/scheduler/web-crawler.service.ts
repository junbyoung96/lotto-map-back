import { Injectable, Logger } from '@nestjs/common';
import axios from "axios";
import * as cheerio from "cheerio";
import * as iconv from "iconv-lite";
import { LottoStore } from 'src/lotto/entities/lotto-store.entity';

export interface Store {
    id: number,
    name: string,
    phone: string,
    address: string,
    lat: number,
    lon: number
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

    async getNewStores() {
        const locations = ["서울", "경기", "부산", "대구", "인천", "대전", "울산", "강원", "충북", "충남", "광주", "전북", "전남", "경북", "경남", "제주", "세종"];
        const stores: Store[] = [];
        for (const location of locations) {
            try {
                const encodedLocation = encodeURIComponent(location);
                const baseUrl = `https://dhlottery.co.kr/store.do?method=sellerInfo645Result&searchType=1&nowPage=1&sltSIDO=${encodedLocation}&sltGUGUN=&rtlrSttus=001`;
                const response = await axios.get(baseUrl, { responseType: 'arraybuffer', responseEncoding: 'binary' });
                const data = iconv.decode(response.data, 'EUC-KR');
                const jsonData = JSON.parse(data);


                for (let i = 1; i <= jsonData.totalPage; i++) {
                    const pageUrl = `https://dhlottery.co.kr/store.do?method=sellerInfo645Result&searchType=1&nowPage=${i}&sltSIDO=${encodedLocation}&sltGUGUN=&rtlrSttus=001`;
                    const pageResponse = await axios.get(pageUrl, { responseType: 'arraybuffer', responseEncoding: 'binary' });
                    let storeData = iconv.decode(pageResponse.data, 'EUC-KR');
                    storeData = storeData.replace(/&&#35;40;/g, '(').replace(/&&#35;41;/g, ')');
                    const jsonStoreData = JSON.parse(storeData);
                    for (let store of jsonStoreData.arr) {
                        const newStore: Store = {
                            id: Number(store.RTLRID),
                            name: store.FIRMNM,
                            phone: store.RTLRSTRTELNO,
                            address: store.BPLCDORODTLADRES,
                            lat: store.LATITUDE,
                            lon: store.LONGITUDE,
                        }
                        stores.push(newStore);
                    }
                }
            } catch (error) {
                this.logger.error('Error retrieving stores by location', error);
                return [];
            }
        }
        return stores;
    }

    async getWinningInfo(drwNo: number) {
        try {
            const response = await axios({
                method: 'post',
                url: `https://dhlottery.co.kr/store.do?method=topStore&pageGubun=L645&nowPage=1&drwNo=${drwNo}&schKey=all`,
                responseType: 'arraybuffer',
                responseEncoding: 'binary',
            });
            const html = iconv.decode(response.data, 'EUC-KR');
            const $ = cheerio.load(html);
            const aTagCount = $("#page_box").children().length;

            if (aTagCount === 0) {
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
// 배열을 객체 맵으로 변환하는 함수
export function arrayToMap(arr: Store[] | LottoStore[]): { [key: number]: Store | LottoStore } {
    const map: { [key: number]: Store | LottoStore } = {};
    for (const e of arr) {
        map[e.id] = e;
    }
    return map;
}

// 개점 및 폐점한 판매점을 찾는 함수
export function findStoreChanges(oldStores: LottoStore[], newStores: Store[]) {
    const oldStoreMap = arrayToMap(oldStores);
    const newStoreMap = arrayToMap(newStores);


    const newOpenedStores: Store[] = [];
    const closedStores: number[] = [];

    // 개점한 판매점 찾기
    for (const newStore of newStores) {
        if (!oldStoreMap[newStore.id]) {
            newOpenedStores.push(newStore);
        }
    }

    // 폐점한 판매점 찾기
    for (const oldStore of oldStores) {
        if (!newStoreMap[oldStore.id]) {
            closedStores.push(oldStore.id);
        }
    }

    return { newOpenedStores, closedStores };
}