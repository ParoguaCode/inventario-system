export class CreateProductDto {
  sku: string;
  name: string;
  currentStock?: number;
  minThreshold: number;
}
