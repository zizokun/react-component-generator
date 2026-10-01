import { describe, it, expect } from 'vitest';
import { parseProvider, parseComponents } from './persistedState';

describe('parseProvider', () => {
  it('지원하지 않는 provider면 null을 반환한다', () => {
    expect(parseProvider('openai')).toBeNull();
  });

  it('지원하는 provider는 그대로 반환한다', () => {
    expect(parseProvider('anthropic')).toBe('anthropic');
  });
});

describe('parseComponents', () => {
  it('저장된 createdAt 문자열을 Date로 복원한다', () => {
    const stored = [{ id: '1', prompt: '카드', code: 'render(<A />);', createdAt: '2026-10-01T04:00:00.000Z' }];
    const [component] = parseComponents(stored) ?? [];
    expect(component.createdAt).toBeInstanceOf(Date);
    expect(component.createdAt.toISOString()).toBe('2026-10-01T04:00:00.000Z');
  });

  it('배열이 아니면 null을 반환한다', () => {
    expect(parseComponents({ id: '1' })).toBeNull();
  });

  it('필드가 빠졌거나 날짜가 잘못된 항목은 버린다', () => {
    const valid = { id: '1', prompt: '카드', code: 'render(<A />);', createdAt: '2026-10-01T04:00:00.000Z' };
    const stored = [valid, { ...valid, id: '2', code: undefined }, { ...valid, id: '3', createdAt: 'yesterday' }, null];
    expect(parseComponents(stored)?.map((c) => c.id)).toEqual(['1']);
  });
});
