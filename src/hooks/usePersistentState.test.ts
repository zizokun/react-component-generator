import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePersistentState } from './usePersistentState';

const parseNumber = (value: unknown) => (typeof value === 'number' ? value : null);

describe('usePersistentState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('localStorage에 저장된 값으로 시작한다', () => {
    localStorage.setItem('count', '7');
    const { result } = renderHook(() => usePersistentState('count', parseNumber, 0));
    expect(result.current[0]).toBe(7);
  });

  it('값을 바꾸면 localStorage에 저장한다', () => {
    const { result } = renderHook(() => usePersistentState('count', parseNumber, 0));
    act(() => result.current[1]((prev) => prev + 1));
    expect(localStorage.getItem('count')).toBe('1');
  });
});
