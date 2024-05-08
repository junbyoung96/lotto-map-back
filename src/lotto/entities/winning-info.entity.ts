import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { LottoStore } from './lotto-store.entity';

@Entity({ name: 'winning_info' })
export class WinningInfo {
    @PrimaryGeneratedColumn()
    win_id: number;

    @Column({ type: 'int', default: 0, nullable: true })
    draw_no: number;

    @Column({ type: 'int', default: 0, nullable: true })
    rank: number;

    @Column({ type: 'varchar', length: 10, nullable: true })
    category: string;

    @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP', nullable: true })
    created_at: Date;

    @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP', nullable: true })
    updated_at: Date;
    
    @ManyToOne(() => LottoStore, store => store.winningInfo)
    @JoinColumn({ name: 'store_id' })
    store: LottoStore;
    
    @Column({ nullable: false })
    store_id: number;
}