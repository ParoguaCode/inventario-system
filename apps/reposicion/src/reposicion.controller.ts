import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { ReposicionService } from './reposicion.service';
import {
  STOCK_LOW_EVENT,
  REPLENISHMENT_LIST_PATTERN,
  StockLowEvent,
} from '@app/contracts';

@Controller()
export class ReposicionController {
  private readonly logger = new Logger(ReposicionController.name);

  constructor(private readonly reposicionService: ReposicionService) {}

  /**
   * Escucha el evento 'stock.low' emitido por el microservicio inventario.
   * Genera automáticamente una orden de reposición si no existe una pendiente.
   */
  @EventPattern(STOCK_LOW_EVENT)
  async handleStockLow(@Payload() event: StockLowEvent): Promise<void> {
    this.logger.log(`Evento recibido: ${STOCK_LOW_EVENT} → ${event.sku}`);
    await this.reposicionService.handleStockLow(event);
  }

  /**
   * Responde al patrón 'replenishment.list' con todas las órdenes de reposición.
   * Consumido por el microservicio producto vía request-response NATS.
   */
  @MessagePattern(REPLENISHMENT_LIST_PATTERN)
  async listOrders() {
    this.logger.log(`Consulta recibida: ${REPLENISHMENT_LIST_PATTERN}`);
    return this.reposicionService.listOrders();
  }
}
