import { Module } from '@nestjs/common';
import { ProductoController } from './producto.controller';
import { ProductoService } from './producto.service';

@Module({
  imports: [],
  controllers: [ProductoController],
  providers: [ProductoService],
})
export class ProductoModule {}
