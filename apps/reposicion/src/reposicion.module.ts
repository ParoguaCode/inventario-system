import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReposicionController } from './reposicion.controller';
import { ReposicionService } from './reposicion.service';
import { ReplenishmentOrder } from './entities/replenishment-order.entity';
import { DB_REPOSICION } from '@app/contracts';

@Module({
  imports: [
    // BD independiente exclusiva de reposicion (pg-reposicion, puerto 5433)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: DB_REPOSICION.HOST,
      port: DB_REPOSICION.PORT,
      username: DB_REPOSICION.USERNAME,
      password: DB_REPOSICION.PASSWORD,
      database: DB_REPOSICION.DATABASE,
      ssl: DB_REPOSICION.HOST.includes('rds.amazonaws.com') ? { rejectUnauthorized: false } : false,
      autoLoadEntities: true,
      synchronize: true, // NOTA: Solo para desarrollo
    }),
    TypeOrmModule.forFeature([ReplenishmentOrder]),
  ],
  controllers: [ReposicionController],
  providers: [ReposicionService],
})
export class ReposicionModule {}
