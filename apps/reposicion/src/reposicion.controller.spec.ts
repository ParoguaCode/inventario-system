import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReposicionController } from './reposicion.controller';
import { ReposicionService } from './reposicion.service';
import { ReplenishmentOrder } from './entities/replenishment-order.entity';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockOrderRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const mockStockLowEvent = {
  productId: 'uuid-prod-1',
  sku: 'SKU-001',
  productName: 'Widget A',
  currentStock: 5,
  minThreshold: 10,
  deficit: 5,
  detectedAt: new Date().toISOString(),
};

const mockOrder: ReplenishmentOrder = {
  id: 'uuid-order-1',
  productId: 'uuid-prod-1',
  sku: 'SKU-001',
  productName: 'Widget A',
  quantityToOrder: 10, // deficit (5) * 2
  status: 'PENDING',
  currentStock: 5,
  minThreshold: 10,
  createdAt: new Date(),
};

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('ReposicionController', () => {
  let controller: ReposicionController;
  let service: ReposicionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReposicionController],
      providers: [
        ReposicionService,
        {
          provide: getRepositoryToken(ReplenishmentOrder),
          useValue: mockOrderRepository,
        },
      ],
    }).compile();

    controller = module.get<ReposicionController>(ReposicionController);
    service = module.get<ReposicionService>(ReposicionService);

    jest.clearAllMocks();
  });

  // ── EventPattern: stock.low ──────────────────────────────────────────────────
  describe('handleStockLow()', () => {
    it('debe crear una orden de reposición cuando no existe una orden PENDING', async () => {
      // No existe orden previa
      mockOrderRepository.findOne.mockResolvedValue(null);
      mockOrderRepository.create.mockReturnValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(mockOrder);

      await controller.handleStockLow(mockStockLowEvent);

      // Verifica búsqueda de orden duplicada
      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: { productId: 'uuid-prod-1', status: 'PENDING' },
      });

      // Verifica creación con cantidad = déficit * 2
      expect(mockOrderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: 'uuid-prod-1',
          sku: 'SKU-001',
          quantityToOrder: 10, // 5 * 2
          status: 'PENDING',
        }),
      );
      expect(mockOrderRepository.save).toHaveBeenCalled();
    });

    it('NO debe crear una orden duplicada si ya existe una PENDING para el mismo producto', async () => {
      // Ya existe una orden pendiente
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);

      await controller.handleStockLow(mockStockLowEvent);

      // No debe crear ni guardar nada
      expect(mockOrderRepository.create).not.toHaveBeenCalled();
      expect(mockOrderRepository.save).not.toHaveBeenCalled();
    });

    it('debe calcular la cantidad correctamente: déficit * 2', async () => {
      const event = { ...mockStockLowEvent, deficit: 8 }; // déficit de 8
      mockOrderRepository.findOne.mockResolvedValue(null);
      mockOrderRepository.create.mockReturnValue({ ...mockOrder, quantityToOrder: 16 });
      mockOrderRepository.save.mockResolvedValue({ ...mockOrder, quantityToOrder: 16 });

      await controller.handleStockLow(event);

      expect(mockOrderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ quantityToOrder: 16 }), // 8 * 2
      );
    });
  });

  // ── MessagePattern: replenishment.list ──────────────────────────────────────
  describe('listOrders()', () => {
    it('debe retornar la lista de órdenes de reposición', async () => {
      mockOrderRepository.find.mockResolvedValue([mockOrder]);

      const result = await controller.listOrders();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 'uuid-order-1',
          sku: 'SKU-001',
          quantityToOrder: 10,
          status: 'PENDING',
        }),
      );
      expect(mockOrderRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });

    it('debe retornar un arreglo vacío si no hay órdenes', async () => {
      mockOrderRepository.find.mockResolvedValue([]);

      const result = await controller.listOrders();

      expect(result).toEqual([]);
    });
  });
});
