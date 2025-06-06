# Typing Battle Game Frontend

This project was bootstrapped with Next.js. Copy `env.template` to `.env` and fill in your Supabase credentials and API keys before running.

## Available Scripts

```bash
npm run dev       # start development server
npm run build     # build for production
npm run lint      # run ESLint
```

## 프로젝트 구조

```
.
├── app
│   ├── game
│   │   └── page.tsx
│   ├── fonts
│   │   ├── GeistMonoVF.woff
│   │   └── GeistVF.woff
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── game
│   │   └── GameCanvas.tsx
│   ├── game-canvas.tsx
│   ├── game-ui.tsx
│   ├── login-screen.tsx
│   └── skin-selection.tsx
├── js
│   ├── core
│   │   ├── Config.js
│   │   ├── EventEmitter.js
│   │   ├── Logger.js
│   │   └── Utils.js
│   ├── modules
│   │   ├── AudioManager.js
│   │   ├── InputManager.js
│   │   ├── NetworkManager.js
│   │   └── StateManager.js
│   ├── GameEngine.js
│   └── app.js
├── lib
│   ├── socket.ts
│   ├── supabase.ts
│   └── utils.ts
├── styles
│   └── main.css
├── types
│   └── game.ts
├── .eslintrc.json
├── .gitignore
├── README.md
├── components.json
├── env.template
├── game.js
├── index.html
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── styles.css
├── tailwind.config.ts
└── tsconfig.json
```

## 디렉토리 및 파일 설명

### 최상위 디렉토리

- `app/`: Next.js 13+의 앱 라우터 디렉토리. 페이지 및 레이아웃 포함.
- `components/`: React 컴포넌트 저장.
- `js/`: 게임 로직과 관련된 JavaScript 파일.
- `lib/`: 유틸리티, 외부 라이브러리 연동 코드.
- `node_modules/`: 프로젝트 의존성.
- `styles/`: 글로벌 스타일시트.
- `types/`: TypeScript 타입 정의.

### 주요 파일

- `next.config.mjs`: Next.js 설정 파일.
- `package.json`: 프로젝트 메타데이터 및 의존성 관리.
- `tailwind.config.ts`: Tailwind CSS 설정 파일.
- `tsconfig.json`: TypeScript 컴파일러 설정.
- `game.js`: 게임의 핵심 로직 (레거시 또는 별도 모듈일 수 있음).
- `index.html`: 정적 HTML 파일 (Next.js 환경에서는 직접 사용되지 않을 수 있음).

### `app`

- `layout.tsx`: 기본 페이지 레이아웃.
- `page.tsx`: 메인 랜딩 페이지.
- `globals.css`: 전역 CSS.
- `game/page.tsx`: 게임 플레이 페이지.
- `fonts/`: 웹폰트 파일.

### `components`

- `game/GameCanvas.tsx`: 게임 렌더링을 위한 캔버스 컴포넌트.
- `game-canvas.tsx`: 게임 캔버스와 관련된 로직.
- `game-ui.tsx`: 게임 UI 요소들 (점수, 시간 등).
- `login-screen.tsx`: 로그인 화면 컴포넌트.
- `skin-selection.tsx`: 캐릭터/스킨 선택 화면.

### `js`

- `GameEngine.js`: 핵심 게임 엔진.
- `app.js`: 애플리케이션의 메인 JavaScript 파일.
- `core/`: 엔진의 핵심 유틸리티 (설정, 이벤트, 로거 등).
- `modules/`: 게임의 주요 기능 모듈 (오디오, 입력, 네트워크, 상태 관리).

### `lib`

- `socket.ts`: WebSocket 연결 관리.
- `supabase.ts`: Supabase 클라이언트 설정.
- `utils.ts`: 공통 유틸리티 함수.

### `styles`

- `main.css`: 메인 스타일시트.

### `types`

- `game.ts`: 게임 관련 TypeScript 타입 정의.
