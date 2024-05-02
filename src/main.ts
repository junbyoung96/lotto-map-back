import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: '*',  // 허용할 오리진
    methods: 'GET,POST',           // 허용할 HTTP 메소드
    allowedHeaders: 'Content-Type,Authorization', // 허용할 헤더
    credentials: true,             // 쿠키를 포함한 요청 허용 여부
  });
  await app.listen(3001);
}
bootstrap();
