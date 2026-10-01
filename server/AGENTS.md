# server/AGENTS.md

## Module Context

Bun 런타임에서 도는 단일 `Bun.serve` 프록시(:3002). 프론트엔드 요청을 받아 Anthropic 또는 Gemini를 호출하고, 응답을 react-live에서 실행 가능한 코드로 정규화해 돌려준다.

## Tech Stack & Constraints

- 공식 SDK 없이 `fetch`로 REST API를 직접 호출한다 (`index.ts:69`, `index.ts:101`). SDK를 추가하지 마라.
- `.env`는 Bun이 자동 로드한다. dotenv를 추가하지 마라 (`index.ts:59-62`).
- Anthropic 모델은 `claude-haiku-4-5-20251001` 단일 (`index.ts:77`). Gemini는 `GOOGLE_MODELS` 배열 순서가 곧 우선순위다 (`index.ts:4-5`).

## Implementation Patterns

- `index.ts`는 import 시점에 서버를 띄운다(`index.ts:138`). 테스트 가능한 로직은 부수효과 없는 별도 모듈로 분리하고 `index.ts`에서 import한다 (`generator.ts:1-2`, `fallback.ts:1-2`).
- 새 순수 모듈은 같은 폴더에 `<name>.ts` + `<name>.test.ts`로 둔다.
- 모든 응답에 `CORS_HEADERS`를 붙인다 (`index.ts:51-55`).

## Testing Strategy

- `bunx vitest run server/`
- 테스트는 `generator.ts`, `fallback.ts` 같은 순수 모듈만 import한다. `index.ts`를 import하면 3002 포트에 실제 서버가 뜬다.
- 폴백 테스트는 `vi.fn`으로 모델별 성공/실패를 흉내 내고 호출 횟수·인자를 검증한다 (`fallback.test.ts:5-13`).

## Local Golden Rules

### Asymmetry

- Gemini 경로만 응답 잘림(`finishReason === 'MAX_TOKENS'`, `index.ts:123-125`)과 모델 폴백(`index.ts:135`)을 처리한다. Anthropic 경로는 `stop_reason`을 확인하지 않고 출력 한도도 4096으로 Gemini(8192)의 절반이다 (`index.ts:78`, `index.ts:107`). Anthropic 경로를 수정할 때는 `stop_reason === 'max_tokens'` 처리를 같은 메시지로 맞추는 것을 검토한다.

### Hard Constraint

- 503/429 매핑은 에러 메시지 문자열에 상태 코드가 들어 있는지로 판단한다 (`index.ts:194`, `index.ts:201`). 프로바이더 호출부에서 던지는 에러 메시지에는 반드시 `${response.status}`를 포함한다 (`index.ts:85`, `index.ts:112`).
- `withModelFallback`은 모든 모델이 실패하면 마지막 에러만 던진다 (`fallback.ts`). 첫 모델의 429는 두 번째 모델의 에러에 가려진다.

### Double Defense

- 코드펜스 금지와 `render` 호출은 프롬프트(`index.ts:12`, `index.ts:16`)와 정규화 함수(`index.ts:188`) 양쪽에서 강제한다. 모델이 지시를 따른다고 가정해 정규화를 제거하지 마라.
- `ensureRenderCall`은 첫 번째 대문자 `const`/`function` 선언을 렌더 대상으로 삼는다 (`generator.ts:19-21`). 정규식을 바꾸면 헬퍼 컴포넌트가 먼저 선언된 응답에서 엉뚱한 컴포넌트가 렌더된다. 바꿀 때는 `generator.test.ts`에 케이스를 추가한다.

### Security Boundary

- Gemini 키는 URL 쿼리에 실린다 (`index.ts:99`). 이 URL을 로그로 남기거나 에러 메시지에 넣지 마라.
- 500 응답은 에러 메시지를 그대로 클라이언트에 돌려준다 (`index.ts:208-211`). throw하는 메시지에 키, 요청 URL, 헤더를 넣지 마라.
- 클라이언트가 보낸 키가 `.env` 키보다 우선한다 (`index.ts:64-66`). 이 우선순위는 UI 안내 문구(`src/App.tsx:65`)와 맞물려 있으니 바꾸면 함께 수정한다.
