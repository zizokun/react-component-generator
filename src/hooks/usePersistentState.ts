import { useEffect, useState } from 'react';
import { readStorage, writeStorage } from '../utils/storage';

/**
 * useState와 같지만 값을 localStorage에 저장해 새로고침 후에도 유지한다.
 * 저장된 값은 parse로 검증하고, 없거나 형식이 틀리면 fallback으로 시작한다.
 */
export function usePersistentState<T>(
  key: string,
  parse: (value: unknown) => T | null,
  fallback: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState(() => readStorage(key, parse, fallback));

  useEffect(() => {
    writeStorage(key, state);
  }, [key, state]);

  return [state, setState];
}
