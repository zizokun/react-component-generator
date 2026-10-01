import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readStorage, writeStorage } from './storage';

const parseNumber = (value: unknown) => (typeof value === 'number' ? value : null);

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('readStorage', () => {
  it('저장된 값이 없으면 기본값을 반환한다', () => {
    expect(readStorage('count', parseNumber, 0)).toBe(0);
  });

  it('저장된 값이 있으면 파싱한 값을 반환한다', () => {
    localStorage.setItem('count', '3');
    expect(readStorage('count', parseNumber, 0)).toBe(3);
  });

  it('저장된 JSON이 깨져 있으면 기본값을 반환한다', () => {
    localStorage.setItem('count', '{broken');
    expect(readStorage('count', parseNumber, 0)).toBe(0);
  });

  it('저장 형식이 맞지 않으면 기본값을 반환한다', () => {
    localStorage.setItem('count', '"three"');
    expect(readStorage('count', parseNumber, 0)).toBe(0);
  });

  it('저장소에 접근할 수 없으면 기본값을 반환한다', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    expect(readStorage('count', parseNumber, 0)).toBe(0);
  });
});

describe('writeStorage', () => {
  it('값을 JSON으로 저장한다', () => {
    writeStorage('items', ['a', 'b']);
    expect(localStorage.getItem('items')).toBe('["a","b"]');
  });

  it('저장 공간이 가득 차도 에러를 던지지 않는다', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    expect(() => writeStorage('items', ['a'])).not.toThrow();
  });
});
