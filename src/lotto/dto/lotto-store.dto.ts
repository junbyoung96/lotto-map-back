import { IsInt, IsNumber, Min } from "class-validator";

export class RequestDto {
    @IsNumber()
    northEastLat: number;
    @IsNumber()
    northEastLon: number;
    @IsNumber()
    southWestLat: number;
    @IsNumber()
    southWestLon: number;
}

export class PagingDTO {
    searchType: string;
    searchWord: string;
    @IsInt()
    @Min(1)
    page: number;
    @IsInt()
    @Min(1)
    showCount: number;
}