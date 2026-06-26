import { Injectable } from '@nestjs/common';

@Injectable()
export class ReposicionService {
  getHello(): string {
    return 'Hello World!';
  }
}
