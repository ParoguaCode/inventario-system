import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ProductoService } from './producto.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateMovementDto } from './dto/create-movement.dto';

@Controller('products')
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productoService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productoService.findAll();
  }

  @Get('replenishment-orders')
  getReplenishmentOrders() {
    return this.productoService.getReplenishmentOrders();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productoService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: Partial<CreateProductDto>) {
    return this.productoService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productoService.remove(id);
  }

  @Post(':id/movements')
  registerMovement(
    @Param('id') id: string,
    @Body() movementDto: CreateMovementDto,
  ) {
    return this.productoService.registerMovement(id, movementDto);
  }
}
