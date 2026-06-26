import {
  Injectable,
  Inject,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateMovementDto } from './dto/create-movement.dto';
import {
  NATS_SERVICE,
  STOCK_MOVEMENT_EVENT,
  REPLENISHMENT_LIST_PATTERN,
  StockMovementEvent,
} from '@app/contracts';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProductoService {
  private readonly logger = new Logger(ProductoService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @Inject(NATS_SERVICE) private readonly natsClient: ClientProxy,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateData: Partial<CreateProductDto>): Promise<Product> {
    await this.findOne(id); // Verificar que exista
    await this.productRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async registerMovement(id: string, movementDto: CreateMovementDto): Promise<{ message: string }> {
    // 1. Verificar que el producto existe
    const product = await this.findOne(id);

    // 2. Preparar el evento
    const event: StockMovementEvent = {
      productId: product.id,
      quantity: movementDto.quantity,
      type: movementDto.type,
      reason: movementDto.reason,
      timestamp: new Date().toISOString(),
    };

    // 3. Emitir el evento NATS.
    // NOTA: El stock NO se actualiza aquí, se actualiza en el microservicio inventario.
    this.natsClient.emit(STOCK_MOVEMENT_EVENT, event);
    this.logger.log(`Stock movement event emitted for product ${product.id}`);

    return { message: 'Movement registered successfully' };
  }

  async getReplenishmentOrders(): Promise<any> {
    // Consultar al microservicio de reposicion vía NATS request-response
    return await firstValueFrom(
      this.natsClient.send(REPLENISHMENT_LIST_PATTERN, {}),
    );
  }
}
