import { Controller, Get } from '@nestjs/common';
import { ReposicionService } from './reposicion.service';

@Controller()
export class ReposicionController {
  constructor(private readonly reposicionService: ReposicionService) {}

  @Get()
  getHello(): string {
    return this.reposicionService.getHello();
  }
}
