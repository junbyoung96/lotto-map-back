# Node.js 공식 이미지를 베이스 이미지로 사용
FROM node:16

# 앱 디렉토리 생성
WORKDIR /usr/src/app

# 앱 의존성 설치
# package.json과 package-lock.json을 복사
COPY package*.json ./


# 환경변수설정
ENV NODE_ENV=production

RUN npm install

COPY . .

RUN npm run build

# 앱 소스 추가


# 앱이 3000 포트에서 구동됨을 명시
EXPOSE 3001

# 앱 실행
CMD ["npm", "run", "start:prod"]