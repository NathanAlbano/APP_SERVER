import { NestFactory } from '@nestjs/core';
import { ArbreModule } from './arbre.module';

async function bootstrap() {
  const app = await NestFactory.create(ArbreModule);
  await app.listen(8080);
}
bootstrap();
