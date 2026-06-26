import { NestFactory } from '@nestjs/core';
import { ReposicionModule } from './reposicion.module';

async function bootstrap() {
  const app = await NestFactory.create(ReposicionModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
