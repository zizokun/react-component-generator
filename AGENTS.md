# AGENTS.md

## Operational Commands

- 패키지 매니저와 서버 런타임은 `bun` 고정. npm/yarn/pnpm 사용 금지 (`bun.lock`).
- `bun run dev` — API 서버(:3002, watch)와 Vite(:5173) 동시 실행.
- `bun run server` — API 서버만 실행.
- `bun run test` — 전체 테스트 (Vitest, jsdom).
- `bunx vitest run <파일경로>` / `bunx vitest run -t "<테스트명>"` — 단일 파일 / 단일 테스트.
- `bun run lint` — ESLint.
- `bun run build` — `tsc -b && vite build`.
- 서버 타입체크: `bunx tsc --noEmit --strict --target es2023 --module esnext --moduleResolution bundler --types bun --skipLibCheck --jsx react-jsx server/*.ts`

## Golden Rules

### Immutable

- 생성 코드 계약은 세 지점이 한 몸이다. 하나를 바꾸면 나머지 둘을 함께 검토한다.
  - `SYSTEM_PROMPT`: import 금지, TS 문법 금지, 인라인 스타일, 마지막에 `render(...)` 호출 (`server/index.ts:7-20`)
  - 서버 정규화: `ensureRenderCall(stripCodeFences(text))` (`server/index.ts:188`)
  - 클라이언트 렌더: react-live `noInline` 모드는 `render(...)` 호출이 없으면 아무것도 그리지 않는다 (`src/components/LivePreview.tsx:10`)
- API 키 값은 서버 밖으로 내보내지 않는다. `/api/config`는 키 존재 여부(boolean)만 반환한다 (`server/index.ts:149-152`). 이 엔드포인트에 키 값이나 일부를 추가하지 마라.

### Do's

- 테스트는 `bun run test`(Vitest)로 실행한다. `bun test`는 Bun 내장 러너라 jsdom·jest-dom 설정(`vite.config.ts` test 블록)을 읽지 않는다.
- `server/` 변경 후에는 위 서버 타입체크 명령을 실행한다. `tsc -b`는 `src`와 `vite.config.ts`만 검사하고 `server/`는 검사하지 않는다 (`tsconfig.app.json:27`, `tsconfig.node.json` include).
- 타입 import는 `import type`을 쓴다. enum, namespace, 생성자 파라미터 프로퍼티는 쓰지 않는다 (`verbatimModuleSyntax`, `erasableSyntaxOnly`: `tsconfig.app.json:14,22`).
- Provider를 추가·변경할 때는 중복 정의를 모두 함께 수정한다: `server/index.ts:57`(타입), `server/index.ts:59-62`(ENV_KEYS), `server/index.ts:171`(에러 메시지 분기), `src/types/index.ts:1`(타입), `src/App.tsx:12-15`(PROVIDER_CONFIG), `src/utils/persistedState.ts`의 `parseProvider`(저장값 검증).

### Don'ts

- `.env.example`에 실제 키 값을 넣지 마라. 값은 비워둔다. `/commit` 스킬은 `.env.example`을 비밀값 검사에서 제외하므로(`.claude/skills/commit/SKILL.md:35`) 여기 들어간 키는 걸러지지 않고 그대로 커밋된다.
- 서버 기본 provider(`anthropic`, `server/index.ts:161`)와 UI 기본 provider(`google`, `src/App.tsx:20`)가 다르다는 점을 "통일"하려고 한쪽을 임의로 바꾸지 마라. 바꾼다면 사용자에게 먼저 확인한다.

## Project Context

- 자연어 프롬프트로 React 컴포넌트를 생성하고 브라우저에서 즉시 미리보기한다.
- Tech Stack: React 19, TypeScript 5.9, Vite 8, Bun, react-live 4, Vitest 4, Testing Library.

## Standards & References

- 코드 주석, 테스트명, 사용자 노출 메시지는 한국어로 작성한다.
- 커밋: 한국어 컨벤션 커밋 `feat|fix|refactor|chore: 요약`. `/commit` 스킬(`.claude/skills/commit/SKILL.md`)을 따른다.
- 워크트리는 로컬 HEAD에서 분기하고(`.claude/settings.json`), `.env`는 `.worktreeinclude`로 복사된다.
- `.agents/skills/`는 Codex용 공용 스킬 사본이며 `.claude/skills/`와 내용을 맞춰 유지한다.
- Maintenance Policy: 이 문서의 규칙·근거 라인이 코드와 어긋나면 작업을 마칠 때 해당 AGENTS.md 업데이트를 제안한다.

## Context Map

- **[API 서버 / AI 호출 (Bun)](./server/AGENTS.md)** — 프로바이더 호출, 모델 폴백, 응답 정규화, 에러 매핑 수정 시.
- **[프론트엔드 UI (React/Vite)](./src/AGENTS.md)** — 컴포넌트, 훅, 미리보기, 키 입력 UX 수정 시.
