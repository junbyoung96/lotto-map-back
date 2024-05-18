import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { WinningInfo } from './winning-info.entity';

@Entity({ name: 'lotto_stores' }) // 테이블 이름을 명시
export class LottoStore {
    @PrimaryColumn()
    id: number;

    @Column({ type: 'varchar', length: 100, nullable: false })
    name: string;

    @Column({ type: 'varchar', length: 30, nullable: true })
    phone: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    address: string;

    @Column({ type: 'numeric', precision: 10, scale: 6, nullable: true })
    lat: number;

    @Column({ type: 'numeric', precision: 10, scale: 6, nullable: true })
    lon: number;
    
    @OneToMany(() => WinningInfo, winningInfo => winningInfo.store)    
    winningInfo: WinningInfo[];
}