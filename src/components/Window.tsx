import type { ReactNode } from 'react';

interface WindowProps {
  title: ReactNode;
  children: ReactNode;
  as?: 'section' | 'aside' | 'article' | 'div';
  className?: string;
  onClose?: () => void;
  closeLabel?: string;
  role?: string;
  'aria-label'?: string;
}

// Mac OS 8 플래티넘 스타일 창. onClose가 있으면 왼쪽에 닫기 상자를 표시한다.
export function Window({
  title,
  children,
  as: Tag = 'section',
  className,
  onClose,
  closeLabel = '닫기',
  ...rest
}: WindowProps) {
  return (
    <Tag className={`window ${className ?? ''}`} {...rest}>
      <div className="window-titlebar">
        {onClose && (
          <button
            type="button"
            className="window-close"
            onClick={onClose}
            aria-label={closeLabel}
            title={closeLabel}
          />
        )}
        <span className="window-stripes" aria-hidden="true" />
        <span className="window-title">{title}</span>
        <span className="window-stripes" aria-hidden="true" />
      </div>
      <div className="window-body">{children}</div>
    </Tag>
  );
}
