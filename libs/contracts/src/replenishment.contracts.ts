export const REPLENISHMENT_LIST_PATTERN = 'replenishment.list';

export interface ReplenishmentOrderDto {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  quantityToOrder: number;
  status: 'PENDING' | 'APPROVED';
  currentStock: number;
  minThreshold: number;
  createdAt: string;
}
