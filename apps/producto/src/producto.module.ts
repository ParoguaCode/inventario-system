import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProductoController } from './producto.controller';
import { ProductoService } from './producto.service';
import { Product } from './entities/product.entity';
import {
  NATS_SERVICE,
  DEFAULT_NATS_URL,
  DB_INVENTARIO,
} from '@app/contracts';

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
    TypeOrmModule.forFeature([Product]),
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
  controllers: [ProductoController],
  providers: [ProductoService],
})
export class ProductoModule {}
