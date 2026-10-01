import { useState, useEffect, useRef } from 'react';
import { PromptInput } from './components/PromptInput';
import { ComponentCard } from './components/ComponentCard';
import { Window } from './components/Window';
import { useComponentGenerator } from './hooks/useComponentGenerator';
import type { Provider } from './types';
import './App.css';

const PROVIDER_CONFIG = {
  anthropic: { label: 'Anthropic', placeholder: 'sk-ant-...' },
  google: { label: 'Google', placeholder: 'AIza...' },
} as const;

function App() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [provider, setProvider] = useState<Provider>('google');
  const [keyMissing, setKeyMissing] = useState(false);
  const [envKeys, setEnvKeys] = useState<Record<Provider, boolean>>({
    anthropic: false,
    google: false,
  });
  const apiKeyRef = useRef<HTMLInputElement>(null);
  const { components, isLoading, error, generate, removeComponent, clearAll } =
    useComponentGenerator();

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setEnvKeys(data.envKeys))
      .catch(() => {});
  }, []);

  const hasEnvKey = envKeys[provider];
  const activeProvider = PROVIDER_CONFIG[provider].label;

  const handleGenerate = (prompt: string) => {
    if (!apiKey.trim() && !hasEnvKey) {
      setKeyMissing(true);
      apiKeyRef.current?.focus();
      return;
    }
    setKeyMissing(false);
    generate(prompt, apiKey || undefined, provider);
  };

  const handleProviderChange = (newProvider: Provider) => {
    setProvider(newProvider);
    setApiKey('');
    setKeyMissing(false);
  };

  const keyStatus = keyMissing
    ? `${activeProvider} API 키가 없습니다. 키를 입력하거나 .env에 설정하세요.`
    : hasEnvKey
      ? '.env 키를 사용합니다. 직접 입력하면 그 키가 우선합니다.'
      : '키를 입력하거나 서버 .env에 설정하세요.';

  return (
    <div className="desktop">
      <header className="menubar">
        <span className="menubar-mark" aria-hidden="true" />
        <h1 className="menubar-title">React 컴포넌트 생성기</h1>
        <div className="menubar-status" aria-label="현재 작업 상태">
          <span>
            <span className={`status-dot ${hasEnvKey || apiKey ? 'status-dot--on' : ''}`} />
            {activeProvider}
          </span>
          <span>컴포넌트 {components.length}개</span>
        </div>
      </header>

      <main className="workspace">
        <Window title="새 컴포넌트" className="composer-window" aria-label="컴포넌트 생성">
          <PromptInput onGenerate={handleGenerate} isLoading={isLoading} />
        </Window>

        <Window as="aside" title="실행 설정" className="settings-window" aria-label="실행 설정">
          <div className="field">
            <label htmlFor="provider">Provider</label>
            <select
              id="provider"
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value as Provider)}
            >
              {Object.entries(PROVIDER_CONFIG).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="api-key">API 키</label>
            <div className="api-key-field">
              <input
                ref={apiKeyRef}
                id="api-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  if (e.target.value) setKeyMissing(false);
                }}
                placeholder={hasEnvKey ? '서버 키 사용 중' : PROVIDER_CONFIG[provider].placeholder}
                aria-describedby="key-status"
                aria-invalid={keyMissing}
              />
              <button className="btn" onClick={() => setShowKey(!showKey)} type="button">
                {showKey ? '숨기기' : '보기'}
              </button>
            </div>
            <p
              id="key-status"
              className={`key-status ${keyMissing ? 'key-status--missing' : ''} ${hasEnvKey ? 'key-status--ready' : ''}`}
            >
              {keyStatus}
            </p>
          </div>
        </Window>
      </main>

      {error && (
        <Window title="생성 실패" className="alert-window" role="alert">
          <div className="alert-body">
            <span className="alert-icon" aria-hidden="true">!</span>
            <p>{error}</p>
          </div>
        </Window>
      )}

      <section className="results" aria-label="생성된 컴포넌트">
        {components.length > 0 && (
          <div className="results-header">
            <h2 className="desktop-label">생성된 컴포넌트</h2>
            <button className="btn" onClick={clearAll}>
              전체 삭제
            </button>
          </div>
        )}

        {isLoading && (
          <Window title="생성 중" className="progress-window">
            <p>컴포넌트를 만들고 있습니다. 보통 10초 안팎 걸립니다.</p>
            <div className="progress-bar" role="progressbar" aria-label="생성 진행 중">
              <span />
            </div>
          </Window>
        )}

        {components.length === 0 && !isLoading && (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">
              <span />
            </div>
            <p>
              아직 만든 컴포넌트가 없습니다.
              <br />
              요청을 적고 컴포넌트 생성을 누르면 여기에 창으로 열립니다.
            </p>
          </div>
        )}

        <div className="results-grid">
          {components.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              onRemove={removeComponent}
              onRegenerate={handleGenerate}
              isLoading={isLoading}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
