// localStorage에서 읽은 값을 앱 상태로 복원하는 파서들.
// 저장 데이터는 이전 버전이 썼거나 손상됐을 수 있으므로 형식을 검증하고, 틀리면 null을 반환한다.
import type { GeneratedComponent, Provider } from '../types';

export const STORAGE_KEYS = {
  components: 'rcg:components',
  provider: 'rcg:provider',
  promptHistory: 'rcg:promptHistory',
} as const;

export function parseProvider(value: unknown): Provider | null {
  return value === 'anthropic' || value === 'google' ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** JSON에는 Date가 문자열로 저장되므로 createdAt을 Date로 되돌린다. 손상된 항목은 목록에서 뺀다. */
export function parseComponents(value: unknown): GeneratedComponent[] | null {
  if (!Array.isArray(value)) return null;

  return value.flatMap((item): GeneratedComponent[] => {
    if (!isRecord(item)) return [];
    const { id, prompt, code, createdAt } = item;
    if (typeof id !== 'string' || typeof prompt !== 'string' || typeof code !== 'string') return [];
    if (typeof createdAt !== 'string') return [];

    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return [];
    return [{ id, prompt, code, createdAt: date }];
  });
}
