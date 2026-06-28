import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Product } from '../../producto/src/entities/product.entity';
import { StockMovement } from './entities/stock-movement.entity';
import {
  NATS_SERVICE,
  STOCK_LOW_EVENT,
  STOCK_OK_EVENT,
  StockMovementEvent,
  StockLowEvent,
  StockOkEvent,
} from '@app/contracts';

@Injectable()
export class InventarioService {
  private readonly logger = new Logger(InventarioService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(StockMovement)
    private readonly movementRepository: Repository<StockMovement>,
    @Inject(NATS_SERVICE) private readonly natsClient: ClientProxy,
  ) {}

  // ─── Manejo del evento stock.movement ──────────────────────────────────────
  async handleStockMovement(event: StockMovementEvent): Promise<void> {
    this.logger.log(
      `Procesando movimiento: producto=${event.productId}, tipo=${event.type}, qty=${event.quantity}`,
    );

    // 1. Obtener el producto desde la BD compartida
    const product = await this.productRepository.findOne({
      where: { id: event.productId },
    });

    if (!product) {
      this.logger.warn(`Producto ${event.productId} no encontrado. Evento ignorado.`);
      throw new NotFoundException(`Product ${event.productId} not found`);
    }

    // 2. Calcular el nuevo stock
    const previousStock = product.currentStock;
    const delta = event.type === 'IN' ? event.quantity : -event.quantity;
    const newStock = Math.max(0, previousStock + delta); // nunca negativo

    // 3. Actualizar el stock en la tabla products (BD compartida)
    await this.productRepository.update(product.id, { currentStock: newStock });

    // 4. Registrar el movimiento en stock_movements
    const movement = this.movementRepository.create({
      productId: product.id,
      sku: product.sku,
      quantity: event.quantity,
      type: event.type,
      reason: event.reason,
      previousStock,
      newStock,
    });
    await this.movementRepository.save(movement);

    this.logger.log(
      `Stock actualizado: ${product.sku} → ${previousStock} → ${newStock} (umbral: ${product.minThreshold})`,
    );

    // 5. Evaluar umbral y emitir evento correspondiente
    if (newStock < product.minThreshold) {
      const stockLowEvent: StockLowEvent = {
        productId: product.id,
        sku: product.sku,
        productName: product.name,
        currentStock: newStock,
        minThreshold: product.minThreshold,
        deficit: product.minThreshold - newStock,
        detectedAt: new Date().toISOString(),
      };
      this.natsClient.emit(STOCK_LOW_EVENT, stockLowEvent);
      this.logger.warn(
        `⚠ Stock bajo: ${product.sku} (${newStock} < ${product.minThreshold}). Emitiendo stock.low...`,
      );
    } else {
      const stockOkEvent: StockOkEvent = {
        productId: product.id,
        sku: product.sku,
        currentStock: newStock,
        checkedAt: new Date().toISOString(),
      };
      this.natsClient.emit(STOCK_OK_EVENT, stockOkEvent);
      this.logger.log(`✓ Stock OK: ${product.sku} (${newStock} >= ${product.minThreshold})`);
    }
  }

  // ─── Consulta de estado de stock ────────────────────────────────────────────
  async getStockStatus(productId: string): Promise<{
    productId: string;
    sku: string;
    name: string;
    currentStock: number;
    minThreshold: number;
    status: 'OK' | 'LOW';
  }> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    return {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      currentStock: product.currentStock,
      minThreshold: product.minThreshold,
      status: product.currentStock < product.minThreshold ? 'LOW' : 'OK',
    };
  }
}
