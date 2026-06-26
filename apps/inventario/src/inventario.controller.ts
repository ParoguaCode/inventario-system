import { Controller, Get } from '@nestjs/common';
import { InventarioService } from './inventario.service';

@Controller()
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Get()
  getHello(): string {
    return this.inventarioService.getHello();
  }
}
