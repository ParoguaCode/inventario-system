import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReplenishmentOrder } from './entities/replenishment-order.entity';
import { StockLowEvent, ReplenishmentOrderDto } from '@app/contracts';

@Injectable()
export class ReposicionService {
  private readonly logger = new Logger(ReposicionService.name);

  constructor(
    @InjectRepository(ReplenishmentOrder)
    private readonly orderRepository: Repository<ReplenishmentOrder>,
  ) {}

  // ─── Manejo del evento stock.low ────────────────────────────────────────────
  async handleStockLow(event: StockLowEvent): Promise<void> {
    this.logger.log(
      `Evento stock.low recibido: ${event.sku} (stock=${event.currentStock}, déficit=${event.deficit})`,
    );

    // 1. Verificar si ya existe una orden PENDING para este producto
    //    (evitar duplicados si el evento se repite por múltiples salidas consecutivas)
    const existingOrder = await this.orderRepository.findOne({
      where: { productId: event.productId, status: 'PENDING' },
    });

    if (existingOrder) {
      this.logger.log(
        `Ya existe una orden PENDING para ${event.sku} (orden: ${existingOrder.id}). Se omite la creación.`,
      );
      return;
    }

    // 2. Calcular cantidad a pedir: déficit * 2 (para tener margen sobre el umbral)
    const quantityToOrder = event.deficit * 2;

    // 3. Crear y persistir la orden de reposición
    const order = this.orderRepository.create({
      productId: event.productId,
      sku: event.sku,
      productName: event.productName,
      quantityToOrder,
      status: 'PENDING',
      currentStock: event.currentStock,
      minThreshold: event.minThreshold,
    });

    const saved = await this.orderRepository.save(order);

    this.logger.log(
      `✅ Orden de reposición creada: ID=${saved.id}, producto=${event.sku}, cantidad=${quantityToOrder}`,
    );
  }

  // ─── Listado de órdenes de reposición ───────────────────────────────────────
  async listOrders(): Promise<ReplenishmentOrderDto[]> {
    const orders = await this.orderRepository.find({
      order: { createdAt: 'DESC' },
    });

    return orders.map((o) => ({
      id: o.id,
      productId: o.productId,
      sku: o.sku,
      productName: o.productName,
      quantityToOrder: o.quantityToOrder,
      status: o.status,
      currentStock: o.currentStock,
      minThreshold: o.minThreshold,
      createdAt: o.createdAt.toISOString(),
    }));
  }
}
