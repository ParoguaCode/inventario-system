import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ProductoModule } from './producto.module';

async function bootstrap() {
  const app = await NestFactory.create(ProductoModule);
  
  // Habilitar CORS
  app.enableCors();

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // elimina propiedades no declaradas en el DTO
      forbidNonWhitelisted: true, // retorna 400 si se envían campos extra
      transform: true,            // convierte tipos automáticamente (e.g. string → number)
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  Logger.log(`Microservicio Producto (HTTP) corriendo en http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
