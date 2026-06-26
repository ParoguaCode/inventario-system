import { Test, TestingModule } from '@nestjs/testing';
import { ReposicionController } from './reposicion.controller';
import { ReposicionService } from './reposicion.service';

describe('ReposicionController', () => {
  let reposicionController: ReposicionController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ReposicionController],
      providers: [ReposicionService],
    }).compile();

    reposicionController = app.get<ReposicionController>(ReposicionController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(reposicionController.getHello()).toBe('Hello World!');
    });
  });
});
