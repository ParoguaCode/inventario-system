import { NestFactory } from '@nestjs/core';
import { InventarioModule } from './inventario.module';

async function bootstrap() {
  const app = await NestFactory.create(InventarioModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
