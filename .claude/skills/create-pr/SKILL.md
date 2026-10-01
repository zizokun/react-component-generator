---
name: create-pr
description: |
  현재 브랜치의 커밋을 분석해 PR 제목과 본문(국문 또는 영문)을 작성하고, 브랜치를 push한 뒤 GitHub PR을 생성한다.
  "PR 만들어줘", "PR 올려줘", "풀 리퀘스트 생성", "이 브랜치 리뷰 요청하자", "/create-pr" 같은 요청에 활성화한다.
  `--dry-run`을 주면 push와 생성 없이 제목·본문만 만들어 보여준다. `--draft`를 주면 draft PR로 만든다. `--lang en|ko`로 언어를 지정한다.
  커밋 작성(/commit), 리뷰 코멘트 반영(/autofix), 머지·리베이스에는 쓰지 않는다.
argument-hint: "[--draft] [--dry-run] [--base <브랜치>] [--lang en|ko] [메모]"
context: fork
allowed-tools: Read Glob Grep Bash
---

# Create PR

현재 브랜치를 PR로 만든다. 이 스킬은 분리된 컨텍스트(fork)에서 실행되므로 원래 대화 내용을 볼 수 없다. 변경의 의도는 커밋, diff, 인자로 받은 메모에서만 읽는다. 사용자에게 질문할 수 없으므로, 판단이 위험한 지점에서는 추측해서 진행하지 말고 **멈춘 뒤 이유와 해결 방법을 보고**한다. 보고는 메인 대화로 돌아가 사용자가 결정한다.

## Step 1. 사전 점검

아래 명령을 병렬로 실행한다.

```bash
git status --short
git branch --show-current
gh auth status
gh repo view --json defaultBranchRef,visibility -q '.defaultBranchRef.name + " " + .visibility'
gh pr view --json url,state 2>/dev/null
```

base 브랜치는 `--base` 인자가 있으면 그것, 없으면 저장소 기본 브랜치다. 그다음 `git fetch origin <base>` 후 다음을 확인한다.

| 상황 | 동작 |
|---|---|
| `gh`가 로그인되어 있지 않음 | 멈춤. `gh auth login` 안내 |
| 현재 브랜치가 base와 같음 | 멈춤. 기본 브랜치에서는 PR을 만들 수 없으므로 `git switch -c <브랜치명>`으로 작업 브랜치를 만들라고 안내 |
| `git log origin/<base>..HEAD`가 비어 있음 | 멈춤. PR에 담을 커밋이 없음 |
| 이 브랜치에 열린 PR이 이미 있음 | 멈춤. 기존 PR URL 보고. 중복 PR을 만들지 않는다 |
| 커밋되지 않은 변경이 있음 | 계속 진행. PR에 포함되지 않는다는 사실을 최종 보고에 적는다 |

## Step 2. 변경 분석

```bash
git log --format='%h %s%n%b' origin/<base>..HEAD
git diff --stat origin/<base>...HEAD
git diff origin/<base>...HEAD
```

- 점 3개(`...`)는 base에서 갈라진 이후의 변경만 보여준다. base에 새로 들어온 커밋이 섞이지 않게 하려는 것이다.
- diff가 매우 크면(대략 1500줄 이상) 전체를 읽지 말고 `--stat`으로 핵심 파일을 고른 뒤 그 파일만 읽는다.
- 저장소에 `AGENTS.md`나 `CLAUDE.md`가 있으면 리뷰 포인트를 찾는 데 참고한다. 특히 변경된 코드가 그 문서의 규칙이나 근거 라인을 건드렸는지 본다.

## Step 3. 비밀값 검사

push하면 되돌리기 어렵고, public 저장소면 즉시 노출된다. diff의 추가된 줄에서 다음을 찾는다.

```bash
git diff origin/<base>...HEAD | grep -nE '^\+.*(sk-ant-[A-Za-z0-9_-]{10,}|AIza[0-9A-Za-z_-]{30,}|AQ\.[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{30,}|-----BEGIN [A-Z ]*PRIVATE KEY)'
git diff --name-only origin/<base>...HEAD | grep -E '(^|/)\.env($|\.)'
```

- 실제 키로 보이는 값이 있으면 멈춘다. 파일과 줄 번호를 보고하되 **키 값 자체는 보고에 옮겨 적지 않는다.** 보고 내용도 대화 기록에 남기 때문이다.
- `.env` 계열 파일이 포함되어 있으면 내용을 확인해, 값이 비어 있는 예시 파일이 아니면 멈춘다.

## Step 4. 언어 결정과 제목 작성

PR 언어는 제목과 본문에 똑같이 적용한다.

- `--lang en` 또는 `--lang ko` 인자가 있으면 그것을 쓴다.
- 없으면 `git log --oneline -20`의 커밋 요약을 보고, 절반 이상이 한글이면 `ko`, 아니면 `en`으로 정한다. 리뷰어가 평소 읽는 언어에 맞추려는 것이다.

제목은 저장소의 커밋 컨벤션(type 접두어 형식)을 따른다. 위에서 본 `git log` 결과로 형식을 확인한다.

- 커밋이 1개면 그 커밋의 요약을 그대로 쓴다.
- 여러 개면 전체를 대표하는 한 줄로 쓴다. type은 가장 비중이 큰 변경 기준(`feat` > `fix` > `refactor` > `chore`).
- 정한 언어로, 50자 이내(영문은 72자 이내), 마침표 없음.

## Step 5. 본문 작성

본문 형식은 이 단계에 와서야 정한다. 앞에서 멈췄다면 템플릿을 읽을 필요가 없다.

1. 저장소에 PR 템플릿이 있으면 그것을 쓴다: `.github/pull_request_template.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `docs/pull_request_template.md`, `.github/PULL_REQUEST_TEMPLATE/` 아래 파일. 이 경우 `references/`의 템플릿은 읽지 않고, 내용만 Step 4에서 정한 언어로 쓴다.
2. 없을 때만 Step 4에서 정한 언어의 템플릿 **하나만** 읽고 그 형식과 작성 지침을 따른다. 나머지 하나는 읽지 않는다.
   - `ko` → `references/template-ko.md`
   - `en` → `references/template-en.md`

검증 섹션에는 **실제로 실행한 명령과 결과만** 적는다. `package.json` scripts 등에서 테스트·린트 명령을 찾아 실행하고, 실패하면 실패했다고 적는다. 실행하지 않은 검증을 통과한 것처럼 쓰면 리뷰어가 잘못된 확신으로 머지하게 된다.

하네스가 지정한 PR attribution 줄이 있으면 본문 끝에 붙인다.

## Step 6. Push와 PR 생성

`--dry-run`이면 이 단계를 건너뛰고 Step 7에서 제목과 본문 전체를 보고한다.

```bash
git push -u origin HEAD
gh pr create --base <base> --title "<제목>" --body "$(cat <<'EOF'
<본문>
EOF
)"
```

- `--draft` 인자가 있으면 `gh pr create`에 `--draft`를 붙인다.
- `--force`, `--force-with-lease`는 쓰지 않는다. push가 거부되면(원격이 앞서 있음) 멈추고 보고한다. 원격 커밋을 덮어쓸지는 사용자가 정할 일이다.
- base 브랜치에 직접 push하지 않는다.

## Step 7. 결과 보고

메인 대화로 돌아가는 유일한 출력이므로 다음을 빠짐없이 담는다.

- PR URL (dry-run이면 "생성하지 않음"), 제목, base ← head
- 포함된 커밋 목록 (`해시 요약`)
- 실행한 검증과 결과
- PR에 포함되지 않은 것: 커밋되지 않은 변경, 그 밖에 제외한 것
- 멈췄다면 어느 단계에서 왜 멈췄는지, 사용자가 할 일
- dry-run이면 제목과 본문 전문
