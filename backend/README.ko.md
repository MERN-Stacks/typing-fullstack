## 프로젝트 구조

```
.
├── env.template
├── package-lock.json
├── package.json
├── prisma
│   └── schema.prisma
├── src
│   ├── app.module.ts
│   ├── game
│   │   ├── game.gateway.ts
│   │   ├── game.module.ts
│   │   └── game.service.ts
│   ├── main.ts
│   └── prisma.service.ts
└── tsconfig.json
```

## 디렉토리 및 파일 설명

### 루트

- `env.template`: 환경 변수 템플릿입니다. 이 파일을 `.env`로 복사하고 값을 채워주세요.
- `package.json`: 프로젝트 종속성을 나열하고 스크립트를 정의합니다.
- `package-lock.json`: 종속성의 정확한 버전을 기록합니다.
- `tsconfig.json`: TypeScript 컴파일러 옵션입니다.

### `prisma/`

- `schema.prisma`: Prisma ORM의 데이터베이스 스키마와 모델을 정의합니다.

### `src/`

- `main.ts`: NestJS 애플리케이션의 진입점입니다.
- `app.module.ts`: 애플리케이션의 루트 모듈입니다.
- `prisma.service.ts`: Prisma 클라이언트 인스턴스를 제공하는 서비스입니다.

### `src/game/`

- `game.module.ts`: 게임 관련 로직을 위한 모듈입니다.
- `game.gateway.ts`: 실시간 게임 이벤트를 처리하기 위한 WebSocket 게이트웨이입니다.
- `game.service.ts`: 핵심 게임 로직을 포함하는 서비스입니다.
