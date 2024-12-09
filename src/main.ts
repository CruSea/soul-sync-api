import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filter/all-exception-filter';
import { ResponseFormatterInterceptor } from './common/interceptor/response-interceptor';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
    allowedHeaders: 'Authorization, Content-Type',
  });
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseFormatterInterceptor());
  await app.listen(3000);
}
bootstrap();
