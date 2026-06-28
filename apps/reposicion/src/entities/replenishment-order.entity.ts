import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('replenishment_orders')
export class ReplenishmentOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @Column()
  sku: string;

  @Column()
  productName: string;

  @Column({ type: 'int' })
  quantityToOrder: number;

  @Column({ type: 'varchar', default: 'PENDING' })
  status: 'PENDING' | 'APPROVED';

  @Column({ type: 'int' })
  currentStock: number;

  @Column({ type: 'int' })
  minThreshold: number;

  @CreateDateColumn()
  createdAt: Date;
}
