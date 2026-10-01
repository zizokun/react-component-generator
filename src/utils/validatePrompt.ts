export const MAX_PROMPT_LENGTH = 500;

/**
 * 프롬프트 길이를 검증한다. 통과하면 null, 실패하면 사용자에게 보여줄 에러 메시지를 반환한다.
 * 전송되는 값과 맞추려고 앞뒤 공백을 제외하고, 이모지가 2글자로 세지지 않도록 코드 포인트 단위로 센다.
 */
export function validatePrompt(prompt: string): string | null {
  if (Array.from(prompt.trim()).length > MAX_PROMPT_LENGTH) {
    return `프롬프트는 ${MAX_PROMPT_LENGTH}자 이하로 입력해주세요.`;
  }
  return null;
}
