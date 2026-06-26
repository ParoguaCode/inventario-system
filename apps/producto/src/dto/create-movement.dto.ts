export class CreateMovementDto {
  quantity: number;
  type: 'IN' | 'OUT';
  reason: string;
}
