import { Module } from '@nestjs/common';
import { ReposicionController } from './reposicion.controller';
import { ReposicionService } from './reposicion.service';

@Module({
  imports: [],
  controllers: [ReposicionController],
  providers: [ReposicionService],
})
export class ReposicionModule {}
