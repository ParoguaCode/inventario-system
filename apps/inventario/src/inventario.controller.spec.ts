import { Test, TestingModule } from '@nestjs/testing';
import { InventarioController } from './inventario.controller';
import { InventarioService } from './inventario.service';

describe('InventarioController', () => {
  let inventarioController: InventarioController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [InventarioController],
      providers: [InventarioService],
    }).compile();

    inventarioController = app.get<InventarioController>(InventarioController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(inventarioController.getHello()).toBe('Hello World!');
    });
  });
});
