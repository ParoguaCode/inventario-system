import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { InventarioController } from './inventario.controller';
import { InventarioService } from './inventario.service';
import { StockMovement } from './entities/stock-movement.entity';
import {
  NATS_SERVICE,
  DEFAULT_NATS_URL,
  DB_INVENTARIO,
} from '@app/contracts';

// Importamos Product desde el microservicio producto (BD compartida pg-inventario)
import { Product } from '../../producto/src/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: DB_INVENTARIO.HOST,
      port: DB_INVENTARIO.PORT,
      username: DB_INVENTARIO.USERNAME,
      password: DB_INVENTARIO.PASSWORD,
      database: DB_INVENTARIO.DATABASE,
      ssl: DB_INVENTARIO.HOST.includes('rds.amazonaws.com') ? { rejectUnauthorized: false } : false,
      autoLoadEntities: true,
      synchronize: true, // NOTA: Solo para desarrollo
    }),
    // Acceso a ambas tablas de pg-inventario (compartida con producto)
    TypeOrmModule.forFeature([Product, StockMovement]),
    // Cliente NATS para emitir stock.low / stock.ok
    ClientsModule.register([
      {
        name: NATS_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URL || DEFAULT_NATS_URL],
        },
      },
    ]),
  ],
  controllers: [InventarioController],
  providers: [InventarioService],
})
export class InventarioModule {}
