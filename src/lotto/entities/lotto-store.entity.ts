import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToMany } from 'typeorm';
import { WinningInfo } from './winning-info.entity';

@Entity({ name: 'lotto_stores' }) // 테이블 이름을 명시
export class LottoStore {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    name: string;

    @Column({ type: 'varchar', length: 30, nullable: true })
    phone: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    address: string;

    @Column({ type: 'numeric', precision: 10, scale: 6, nullable: true })
    lat: number;

    @Column({ type: 'numeric', precision: 10, scale: 6, nullable: true })
    lon: number;

    @Column({ type: 'int', default: 0, nullable: true })
    first_prize: number;

    @Column({ type: 'int', default: 0, nullable: true })
    second_prize: number;

    @Column({ type: 'int', default: 0, nullable: true })
    score: number;

    @OneToMany(() => WinningInfo, winningInfo => winningInfo.store)    
    winningInfo: WinningInfo[];
}