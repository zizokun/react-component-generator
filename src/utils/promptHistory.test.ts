import { describe, it, expect } from 'vitest';
import { addPromptToHistory, parsePromptHistory } from './promptHistory';

describe('addPromptToHistory', () => {
  it('새 프롬프트를 맨 앞에 추가한다', () => {
    expect(addPromptToHistory(['이전'], '새로운')).toEqual(['새로운', '이전']);
  });

  it('이미 있는 프롬프트는 중복 없이 맨 앞으로 옮긴다', () => {
    expect(addPromptToHistory(['a', 'b', 'c'], 'b')).toEqual(['b', 'a', 'c']);
  });

  it('최대 10개까지만 보관하고 오래된 것부터 버린다', () => {
    const history = Array.from({ length: 10 }, (_, i) => `p${i}`);
    const next = addPromptToHistory(history, '새로운');
    expect(next).toHaveLength(10);
    expect(next[0]).toBe('새로운');
    expect(next).not.toContain('p9');
  });
});

describe('parsePromptHistory', () => {
  it('문자열 배열이 아니면 null을 반환한다', () => {
    expect(parsePromptHistory({ prompts: ['a'] })).toBeNull();
  });

  it('문자열이 아닌 항목은 버리고 최대 개수로 자른다', () => {
    const stored = ['a', 1, null, ...Array.from({ length: 12 }, (_, i) => `p${i}`)];
    const parsed = parsePromptHistory(stored);
    expect(parsed).toHaveLength(10);
    expect(parsed?.[0]).toBe('a');
  });
});
