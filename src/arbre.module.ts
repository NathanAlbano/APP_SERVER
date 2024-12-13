import { Module } from '@nestjs/common';
import { ArbreController } from './arbre.controller';
import { ArbreService } from './arbre.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [ArbreController],
  providers: [ArbreService],
})
export class ArbreModule {}
