import { Injectable } from '@nestjs/common';

@Injectable()
export class InventarioService {
  getHello(): string {
    return 'Hello World!';
  }
}
