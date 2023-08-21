import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({ origin: "*", credentials: true });
  const PORT = process.env.PORT || 3000;
  await app.listen(3000);
  console.log(`Application is running on port: ${PORT}`);
}
bootstrap();
