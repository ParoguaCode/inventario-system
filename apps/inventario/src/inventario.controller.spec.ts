import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InventarioController } from './inventario.controller';
import { InventarioService } from './inventario.service';
import { StockMovement } from './entities/stock-movement.entity';
import { NATS_SERVICE } from '@app/contracts';
import { Product } from '../../producto/src/entities/product.entity';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockProductRepository = {
  findOne: jest.fn(),
  update: jest.fn(),
};

const mockMovementRepository = {
  create: jest.fn(),
  save: jest.fn(),
};

const mockNatsClient = {
  emit: jest.fn(),
};

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const mockProduct: Product = {
  id: 'uuid-prod-1',
  sku: 'SKU-001',
  name: 'Widget A',
  currentStock: 50,
  minThreshold: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('InventarioController', () => {
  let controller: InventarioController;
  let service: InventarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventarioController],
      providers: [
        InventarioService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(StockMovement),
          useValue: mockMovementRepository,
        },
        {
          provide: NATS_SERVICE,
          useValue: mockNatsClient,
        },
      ],
    }).compile();

    controller = module.get<InventarioController>(InventarioController);
    service = module.get<InventarioService>(InventarioService);

    jest.clearAllMocks();
  });

  // ── EventPattern: stock.movement ────────────────────────────────────────────
  describe('handleStockMovement()', () => {
    it('debe actualizar stock y emitir stock.ok cuando el stock supera el umbral (entrada)', async () => {
      mockProductRepository.findOne.mockResolvedValue({ ...mockProduct, currentStock: 50 });
      mockProductRepository.update.mockResolvedValue({ affected: 1 });
      mockMovementRepository.create.mockReturnValue({});
      mockMovementRepository.save.mockResolvedValue({});

      const event = {
        productId: 'uuid-prod-1',
        quantity: 10,
        type: 'IN' as const,
        reason: 'Recepción de mercadería',
        timestamp: new Date().toISOString(),
      };

      await controller.handleStockMovement(event);

      // Stock pasa de 50 → 60, umbral es 10 → debe emitir stock.ok
      expect(mockProductRepository.update).toHaveBeenCalledWith('uuid-prod-1', { currentStock: 60 });
      expect(mockNatsClient.emit).toHaveBeenCalledWith(
        'stock.ok',
        expect.objectContaining({ productId: 'uuid-prod-1', currentStock: 60 }),
      );
    });

    it('debe emitir stock.low cuando el stock cae por debajo del umbral (salida)', async () => {
      // Stock actual: 15, umbral: 10 → salida de 10 → queda en 5 < 10
      mockProductRepository.findOne.mockResolvedValue({ ...mockProduct, currentStock: 15 });
      mockProductRepository.update.mockResolvedValue({ affected: 1 });
      mockMovementRepository.create.mockReturnValue({});
      mockMovementRepository.save.mockResolvedValue({});

      const event = {
        productId: 'uuid-prod-1',
        quantity: 10,
        type: 'OUT' as const,
        reason: 'Venta',
        timestamp: new Date().toISOString(),
      };

      await controller.handleStockMovement(event);

      // Stock pasa de 15 → 5, umbral es 10 → debe emitir stock.low
      expect(mockProductRepository.update).toHaveBeenCalledWith('uuid-prod-1', { currentStock: 5 });
      expect(mockNatsClient.emit).toHaveBeenCalledWith(
        'stock.low',
        expect.objectContaining({
          productId: 'uuid-prod-1',
          currentStock: 5,
          minThreshold: 10,
          deficit: 5,
        }),
      );
    });

    it('no debe dejar el stock en negativo (salida mayor al stock disponible)', async () => {
      // Stock actual: 3, intento de salida de 10 → debe quedar en 0, no en -7
      mockProductRepository.findOne.mockResolvedValue({ ...mockProduct, currentStock: 3 });
      mockProductRepository.update.mockResolvedValue({ affected: 1 });
      mockMovementRepository.create.mockReturnValue({});
      mockMovementRepository.save.mockResolvedValue({});

      const event = {
        productId: 'uuid-prod-1',
        quantity: 10,
        type: 'OUT' as const,
        reason: 'Venta urgente',
        timestamp: new Date().toISOString(),
      };

      await controller.handleStockMovement(event);

      expect(mockProductRepository.update).toHaveBeenCalledWith('uuid-prod-1', { currentStock: 0 });
    });

    it('debe ignorar el evento si el producto no existe', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      const event = {
        productId: 'id-inexistente',
        quantity: 5,
        type: 'IN' as const,
        reason: 'Test',
        timestamp: new Date().toISOString(),
      };

      await expect(controller.handleStockMovement(event)).rejects.toThrow();
      expect(mockProductRepository.update).not.toHaveBeenCalled();
      expect(mockNatsClient.emit).not.toHaveBeenCalled();
    });
  });

  // ── MessagePattern: stock.status ────────────────────────────────────────────
  describe('getStockStatus()', () => {
    it('debe retornar estado OK cuando el stock supera el umbral', async () => {
      mockProductRepository.findOne.mockResolvedValue({ ...mockProduct, currentStock: 50 });

      const result = await controller.getStockStatus({ productId: 'uuid-prod-1' });

      expect(result).toEqual(
        expect.objectContaining({
          productId: 'uuid-prod-1',
          currentStock: 50,
          status: 'OK',
        }),
      );
    });

    it('debe retornar estado LOW cuando el stock está por debajo del umbral', async () => {
      mockProductRepository.findOne.mockResolvedValue({ ...mockProduct, currentStock: 5 });

      const result = await controller.getStockStatus({ productId: 'uuid-prod-1' });

      expect(result).toEqual(
        expect.objectContaining({
          currentStock: 5,
          minThreshold: 10,
          status: 'LOW',
        }),
      );
    });

    it('debe lanzar error si el producto no existe', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(
        controller.getStockStatus({ productId: 'id-inexistente' }),
      ).rejects.toThrow('Product id-inexistente not found');
    });
  });
});
