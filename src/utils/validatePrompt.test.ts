import { describe, it, expect } from 'vitest';
import { validatePrompt } from './validatePrompt';

describe('validatePrompt', () => {
  it('500자 이하 프롬프트는 통과한다', () => {
    expect(validatePrompt('a'.repeat(500))).toBeNull();
  });

  it('500자를 넘으면 에러 메시지를 반환한다', () => {
    expect(validatePrompt('a'.repeat(501))).toBe('프롬프트는 500자 이하로 입력해주세요.');
  });

  it('앞뒤 공백은 길이에 포함하지 않는다', () => {
    expect(validatePrompt(`  ${'a'.repeat(500)}\n`)).toBeNull();
  });

  it('이모지는 한 글자로 센다', () => {
    expect(validatePrompt('😀'.repeat(500))).toBeNull();
  });
});
