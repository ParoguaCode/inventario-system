import { NestFactory } from '@nestjs/core';
import { ProductoModule } from './producto.module';

async function bootstrap() {
  const app = await NestFactory.create(ProductoModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
