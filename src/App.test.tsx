import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// 서버 API를 흉내 낸다. 서버 .env 키는 없고, 생성 요청은 고정 코드를 돌려준다.
function mockApiFetch() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) =>
      url === '/api/config'
        ? Response.json({ envKeys: { anthropic: false, google: false } })
        : Response.json({ code: 'render(<div>미리보기</div>);' }),
    ),
  );
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    mockApiFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('새로고침 전에 선택한 provider를 복원한다', () => {
    localStorage.setItem('rcg:provider', '"anthropic"');
    render(<App />);
    expect(screen.getByRole('combobox', { name: 'Provider' })).toHaveValue('anthropic');
  });

  it('생성을 요청한 프롬프트를 최근 프롬프트에 남긴다', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('API 키'), 'test-key');
    await user.type(screen.getByRole('textbox', { name: '무엇을 만들까요?' }), '프로필 카드');
    await user.click(screen.getByRole('button', { name: '컴포넌트 생성' }));

    expect(await screen.findByText('최근 프롬프트')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('rcg:promptHistory') ?? '[]')).toEqual(['프로필 카드']);
  });

  // 보안 회귀 방지: 생성 코드가 같은 출처에서 실행되므로 키가 localStorage에 있으면 읽힐 수 있다.
  it('입력한 API 키는 localStorage에 저장하지 않는다', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('API 키'), 'secret-key-123');

    const stored = Object.keys(localStorage).map((key) => localStorage.getItem(key)).join('');
    expect(stored).not.toContain('secret-key-123');
  });
});
