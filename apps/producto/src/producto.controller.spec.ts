import { Test, TestingModule } from '@nestjs/testing';
import { ProductoController } from './producto.controller';
import { ProductoService } from './producto.service';

describe('ProductoController', () => {
  let productoController: ProductoController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProductoController],
      providers: [ProductoService],
    }).compile();

    productoController = app.get<ProductoController>(ProductoController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(productoController.getHello()).toBe('Hello World!');
    });
  });
});
