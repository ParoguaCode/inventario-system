import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ProductoModule } from './producto.module';

async function bootstrap() {
  const app = await NestFactory.create(ProductoModule);
  
  // Habilitar CORS
  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  Logger.log(`Microservicio Producto (HTTP) corriendo en http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
