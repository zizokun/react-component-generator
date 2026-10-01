# src/AGENTS.md

## Module Context

React 19 + Vite SPA. 서버와는 `/api/config`, `/api/generate` 두 엔드포인트로만 통신하고, 생성된 코드는 react-live로 런타임 렌더링한다.

## Tech Stack & Constraints

- API 호출은 상대 경로 `/api/...`만 쓴다 (`hooks/useComponentGenerator.ts:29`, `App.tsx:36`). Vite 프록시(`vite.config.ts` server.proxy)가 3002로 넘긴다. `http://localhost:3002`를 하드코딩하지 마라.
- 상태 관리 라이브러리 없음. 생성 목록과 로딩·에러 상태는 `useComponentGenerator` 훅 하나가 소유한다.
- 새로고침 후에도 유지할 상태는 `usePersistentState`(`hooks/usePersistentState.ts`)로 만든다. localStorage를 직접 호출하지 말고, 키는 `STORAGE_KEYS`(`utils/persistedState.ts`)에 `rcg:` 접두어로 추가하고, 읽은 값을 검증하는 parse 함수를 함께 만든다. 저장 데이터는 이전 버전이 썼거나 손상됐을 수 있기 때문이다.
- ESLint `react-refresh` 규칙이 켜져 있다 (`eslint.config.js:16`). 컴포넌트 파일에서는 컴포넌트만 export한다.

## Implementation Patterns

- 화면의 모든 패널은 `Window` 컴포넌트로 감싼다 (Mac OS 8 플래티넘 스타일, `components/Window.tsx:14`). 시맨틱 태그는 `as` prop으로 지정한다.
- CSS 클래스는 `App.css`에 두고 `block--modifier` 형식을 쓴다 (예: `key-status--missing`, `btn--default`).
- UI 문구는 한국어로 작성한다.

## Testing Strategy

- `bunx vitest run src/`
- Testing Library + `user-event`. 요소는 role과 한국어 접근성 이름으로 찾는다 (`components/PromptInput.test.tsx:19`).
- DOM 정리는 `test/setup.ts`의 `afterEach(cleanup)`이 담당한다. 테스트 파일에서 따로 cleanup하지 마라.

## Local Golden Rules

### Test Boundary

- `ComponentCard`, `LivePreview`, `CodeView`, `Window`는 테스트가 없으므로 수정 시 `bun run dev`로 직접 확인한다.
- `App.test.tsx`는 `fetch`를 `vi.stubGlobal`로 대체해 서버 없이 돈다. `App`이 새 엔드포인트를 호출하면 `mockApiFetch`에 응답을 추가한다.
- 버튼 문구 `컴포넌트 생성`, `생성 중...`(`components/PromptInput.tsx:63`)은 테스트 선택자로 쓰인다 (`components/PromptInput.test.tsx:19`, `:37`). 문구를 바꾸면 테스트도 함께 수정한다.

### Hard Constraint

- 미리보기 새로고침은 `LivePreview`의 `key`를 증가시켜 리마운트하는 방식이다 (`components/ComponentCard.tsx:55`, `:73`). 애니메이션 컴포넌트를 다시 재생하는 기능이므로 `key`를 제거하지 마라.
- `LivePreview`의 `noInline`(`components/LivePreview.tsx:10`)을 끄면 서버가 주입한 `render(...)` 호출과 충돌한다. 루트 AGENTS.md의 생성 코드 계약을 참고한다.

### Double Defense

- 키 누락은 클라이언트(`App.tsx:46-50`)와 서버(`server/index.ts:169`) 양쪽에서 막는다. 클라이언트 검사는 UX(입력창 포커스), 서버 검사는 최종 판단이다. 어느 한쪽도 제거하지 마라.
- 빈 프롬프트도 클라이언트(`components/PromptInput.tsx:21`, `:25`, `:61`)와 서버(`server/index.ts:176`)가 각각 막는다.
- 제출 가능 여부는 `canSubmit` 하나로 판단한다 (`components/PromptInput.tsx:21`). 버튼 `disabled`만 막으면 Cmd+Enter 경로(`onKeyDown`)로 제출이 새므로, 새 제출 조건은 반드시 `canSubmit`에 추가한다.
- 500자 제한(`utils/validatePrompt.ts`)은 현재 클라이언트에만 있고 서버 검증은 없다. 위 이중 방어 패턴과 다르므로, `/api/generate`를 직접 호출하면 제한을 우회할 수 있다는 점을 알고 다룬다.

### Asymmetry

- `/api/config` 실패는 조용히 무시된다 (`App.tsx:39`). 이때 `envKeys`가 모두 false로 남아 사용자에게 키 입력을 요구하는 쪽으로 안전하게 동작한다. 에러 UI를 추가하더라도 이 기본값은 유지한다.

### Security Boundary

- 사용자 입력 API 키는 컴포넌트 state에만 둔다 (`App.tsx:18`). localStorage·sessionStorage·URL에 저장하지 마라. 생성된 코드가 react-live로 같은 출처에서 실행되므로 저장소에 있는 값은 생성 코드가 읽을 수 있다. 이 규칙은 `App.test.tsx`의 회귀 테스트가 지킨다.
- 같은 이유로 localStorage의 `rcg:components`는 생성 코드가 덮어쓸 수 있고, 새로고침 시 그대로 렌더된다. 저장된 컴포넌트 코드를 신뢰할 수 있는 입력으로 취급하지 마라.
- provider를 바꾸면 입력한 키를 비운다 (`App.tsx:58`). 다른 프로바이더로 키가 전송되는 것을 막는 처리이므로 유지한다.
- 키는 값이 있을 때만 요청 본문에 넣는다 (`hooks/useComponentGenerator.ts:32`). 키가 없으면 서버가 `.env` 키로 대체한다 (`server/index.ts:65`). 이 대체를 막는 기본값(예: 플레이스홀더 문자열)을 보내지 마라.
