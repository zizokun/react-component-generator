export const MAX_PROMPT_HISTORY = 10;

/** 최근 사용한 프롬프트를 맨 앞에 추가한다. 중복은 맨 앞으로 옮기고, 최대 개수를 넘으면 오래된 것부터 버린다. */
export function addPromptToHistory(history: string[], prompt: string): string[] {
  return [prompt, ...history.filter((item) => item !== prompt)].slice(0, MAX_PROMPT_HISTORY);
}

/** localStorage에서 읽은 값을 검증한다. 손상된 항목은 버리고, 형식 자체가 틀리면 null을 반환한다. */
export function parsePromptHistory(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  return value.filter((item): item is string => typeof item === 'string').slice(0, MAX_PROMPT_HISTORY);
}
