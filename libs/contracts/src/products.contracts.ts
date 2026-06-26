export const STOCK_MOVEMENT_EVENT = 'stock.movement';

export interface StockMovementEvent {
  productId: string;
  quantity: number;
  type: 'IN' | 'OUT';
  reason: string;
  timestamp: string;
}
