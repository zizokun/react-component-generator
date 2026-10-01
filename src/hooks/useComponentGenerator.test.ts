import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useComponentGenerator } from './useComponentGenerator';

describe('useComponentGenerator', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('새로고침 전에 저장된 컴포넌트 목록을 복원한다', () => {
    localStorage.setItem(
      'rcg:components',
      JSON.stringify([{ id: '1', prompt: '카드', code: 'render(<A />);', createdAt: '2026-10-01T04:00:00.000Z' }]),
    );

    const { result } = renderHook(() => useComponentGenerator());

    expect(result.current.components.map((c) => c.prompt)).toEqual(['카드']);
  });
});
