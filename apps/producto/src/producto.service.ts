import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductoService {
  getHello(): string {
    return 'Hello World!';
  }
}
