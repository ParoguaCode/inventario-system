import { Controller, Get } from '@nestjs/common';
import { ProductoService } from './producto.service';

@Controller()
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Get()
  getHello(): string {
    return this.productoService.getHello();
  }
}
