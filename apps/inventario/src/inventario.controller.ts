import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { InventarioService } from './inventario.service';
import {
  STOCK_MOVEMENT_EVENT,
  STOCK_STATUS_PATTERN,
  StockMovementEvent,
} from '@app/contracts';

@Controller()
export class InventarioController {
  private readonly logger = new Logger(InventarioController.name);

  constructor(private readonly inventarioService: InventarioService) {}

  /**
   * Escucha el evento 'stock.movement' publicado por el microservicio producto.
   * No retorna respuesta (fire-and-forget vía emit).
   */
  @EventPattern(STOCK_MOVEMENT_EVENT)
  async handleStockMovement(@Payload() event: StockMovementEvent): Promise<void> {
    this.logger.log(`Evento recibido: ${STOCK_MOVEMENT_EVENT}`);
    await this.inventarioService.handleStockMovement(event);
  }

  /**
   * Responde al patrón 'stock.status' con el estado actual del stock de un producto.
   * Usa MessagePattern para request-response (send/reply).
   */
  @MessagePattern(STOCK_STATUS_PATTERN)
  async getStockStatus(@Payload() data: { productId: string }) {
    this.logger.log(`Consulta de stock para producto: ${data.productId}`);
    return this.inventarioService.getStockStatus(data.productId);
  }
}
