// localStorage 읽기·쓰기 래퍼. 사파리 사생활 보호 모드, 용량 초과, 깨진 데이터 등
// 저장소 문제로 앱이 멈추지 않도록 모든 실패를 기본값으로 흡수한다.

export function readStorage<T>(key: string, parse: (value: unknown) => T | null, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return parse(JSON.parse(raw)) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 용량 초과나 접근 차단 시 저장만 건너뛴다. 화면 상태는 메모리에 그대로 남는다.
  }
}
