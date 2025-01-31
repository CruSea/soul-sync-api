import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filter/exception-filter';
import { ResponseInterceptor } from './common/interceptor/response/response.interceptor';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: [
      'https://f7xs9l1w-9000.uks1.devtunnels.ms',
      'https://sbkh2slb-9000.uks1.devtunnels.ms',
    ],
    credentials: true,
    allowedHeaders: 'Authorization, Content-Type',
  });
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  await app.listen(process.env.PORT);
}
bootstrap();
