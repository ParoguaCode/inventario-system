export const STOCK_LOW_EVENT = 'stock.low';
export const STOCK_OK_EVENT = 'stock.ok';
export const STOCK_STATUS_PATTERN = 'stock.status';

export interface StockLowEvent {
  productId: string;
  sku: string;
  productName: string;
  currentStock: number;
  minThreshold: number;
  deficit: number;         // threshold - currentStock
  detectedAt: string;
}

export interface StockOkEvent {
  productId: string;
  sku: string;
  currentStock: number;
  checkedAt: string;
}
