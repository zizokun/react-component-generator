import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptInput } from './PromptInput';

// 500자를 넘는 프롬프트를 붙여넣은 상태로 렌더한다. 501자를 type으로 치면 느려서 paste를 쓴다.
async function renderWithLongPrompt() {
  const onGenerate = vi.fn();
  const user = userEvent.setup();
  render(<PromptInput onGenerate={onGenerate} isLoading={false} />);
  await user.click(screen.getByRole('textbox'));
  await user.paste('a'.repeat(501));
  return { user, onGenerate };
}

describe('PromptInput', () => {
  it('프롬프트가 비어 있으면 생성 버튼이 비활성이다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);
    expect(screen.getByRole('button', { name: '컴포넌트 생성' })).toBeDisabled();
  });

  it('입력하면 버튼이 활성화되고 클릭 시 입력값으로 onGenerate가 호출된다', async () => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);

    await user.type(screen.getByRole('textbox'), '프로필 카드');
    const submit = screen.getByRole('button', { name: '컴포넌트 생성' });
    expect(submit).toBeEnabled();

    await user.click(submit);
    expect(onGenerate).toHaveBeenCalledWith('프로필 카드');
  });

  it('로딩 중에는 생성 버튼이 비활성이고 "생성 중..." 을 보여준다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={true} />);
    expect(screen.getByRole('button', { name: '생성 중...' })).toBeDisabled();
  });

  it('500자를 넘기면 에러 메시지를 보여준다', async () => {
    await renderWithLongPrompt();

    expect(screen.getByRole('alert')).toHaveTextContent('프롬프트는 500자 이하로 입력해주세요.');
  });

  it('500자를 넘기면 생성 버튼이 비활성이다', async () => {
    await renderWithLongPrompt();

    expect(screen.getByRole('button', { name: '컴포넌트 생성' })).toBeDisabled();
  });

  it('500자를 넘기면 Cmd+Enter로도 생성되지 않는다', async () => {
    const { user, onGenerate } = await renderWithLongPrompt();
    await user.keyboard('{Meta>}{Enter}{/Meta}');

    expect(onGenerate).not.toHaveBeenCalled();
  });

  it('500자를 넘기면 입력창이 invalid 상태가 되고 에러 메시지와 연결된다', async () => {
    await renderWithLongPrompt();

    const textbox = screen.getByRole('textbox');
    expect(textbox).toHaveAttribute('aria-invalid', 'true');
    expect(textbox).toHaveAccessibleDescription('프롬프트는 500자 이하로 입력해주세요.');
  });
});
