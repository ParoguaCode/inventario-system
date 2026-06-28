import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductoController } from './producto.controller';
import { ProductoService } from './producto.service';
import { Product } from './entities/product.entity';
import { NATS_SERVICE } from '@app/contracts';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockProductRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockNatsClient = {
  emit: jest.fn(),
  send: jest.fn(),
};

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const mockProduct: Product = {
  id: 'uuid-test-1',
  sku: 'SKU-001',
  name: 'Producto Test',
  currentStock: 50,
  minThreshold: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('ProductoController', () => {
  let controller: ProductoController;
  let service: ProductoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductoController],
      providers: [
        ProductoService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: NATS_SERVICE,
          useValue: mockNatsClient,
        },
      ],
    }).compile();

    controller = module.get<ProductoController>(ProductoController);
    service = module.get<ProductoService>(ProductoService);

    jest.clearAllMocks();
  });

  // ── POST /products ──────────────────────────────────────────────────────────
  describe('create()', () => {
    it('debe crear un producto y retornarlo', async () => {
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);

      const dto = { sku: 'SKU-001', name: 'Producto Test', minThreshold: 10 };
      const result = await controller.create(dto);

      expect(mockProductRepository.create).toHaveBeenCalledWith(dto);
      expect(mockProductRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });
  });

  // ── GET /products ───────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('debe retornar un arreglo de productos', async () => {
      mockProductRepository.find.mockResolvedValue([mockProduct]);

      const result = await controller.findAll();

      expect(result).toEqual([mockProduct]);
      expect(mockProductRepository.find).toHaveBeenCalled();
    });
  });

  // ── GET /products/:id ───────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('debe retornar un producto por id', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne('uuid-test-1');

      expect(result).toEqual(mockProduct);
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-test-1' },
      });
    });

    it('debe lanzar NotFoundException si el producto no existe', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(controller.findOne('id-inexistente')).rejects.toThrow(
        'Product with ID id-inexistente not found',
      );
    });
  });

  // ── PUT /products/:id ───────────────────────────────────────────────────────
  describe('update()', () => {
    it('debe actualizar y retornar el producto', async () => {
      const updated = { ...mockProduct, name: 'Nombre Actualizado' };
      mockProductRepository.findOne
        .mockResolvedValueOnce(mockProduct)   // findOne en update() — verificación
        .mockResolvedValueOnce(updated);       // findOne final — retorno

      mockProductRepository.update.mockResolvedValue({ affected: 1 });

      const result = await controller.update('uuid-test-1', { name: 'Nombre Actualizado' });

      expect(result.name).toBe('Nombre Actualizado');
    });
  });

  // ── DELETE /products/:id ────────────────────────────────────────────────────
  describe('remove()', () => {
    it('debe eliminar el producto', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockProductRepository.remove.mockResolvedValue(mockProduct);

      await expect(controller.remove('uuid-test-1')).resolves.toBeUndefined();
      expect(mockProductRepository.remove).toHaveBeenCalledWith(mockProduct);
    });
  });

  // ── POST /products/:id/movements ────────────────────────────────────────────
  describe('registerMovement()', () => {
    it('debe emitir el evento NATS y retornar mensaje de éxito', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const movementDto = { quantity: 5, type: 'IN' as const, reason: 'Compra' };
      const result = await controller.registerMovement('uuid-test-1', movementDto);

      expect(mockNatsClient.emit).toHaveBeenCalledWith(
        'stock.movement',
        expect.objectContaining({
          productId: mockProduct.id,
          quantity: 5,
          type: 'IN',
          reason: 'Compra',
        }),
      );
      expect(result).toEqual({ message: 'Movement registered successfully' });
    });
  });
});
