import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  
  let appOptions = {};
  
  if(process.env.NODE_ENV === "production"){
    const httpsOptions = {
      key: fs.readFileSync(path.join(__dirname, '..', 'ssl', 'private.key')),
      cert: fs.readFileSync(path.join(__dirname, '..', 'ssl', 'certificate.crt'))
    };
    appOptions = { httpsOptions };
  }
  
  const app = await NestFactory.create(AppModule, appOptions);

  app.enableCors({
    origin: '*',  // 허용할 오리진
    methods: 'GET,POST',           // 허용할 HTTP 메소드
    allowedHeaders: 'Content-Type,Authorization', // 허용할 헤더
    credentials: true,             // 쿠키를 포함한 요청 허용 여부
  });
  
  app.useGlobalPipes(new ValidationPipe()); //모든요청에 유효성검사
  await app.listen(3001);
}
bootstrap();