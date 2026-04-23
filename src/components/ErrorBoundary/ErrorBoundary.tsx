import React from 'react';

type Props = {
  children: React.ReactNode;
};

type State = {
  error: Error | null;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Keep console logging for debugging; UI shows a friendly message.
    // eslint-disable-next-line no-console
    console.error('UI crashed:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, maxWidth: 900, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ fontSize: 14, marginBottom: 12, color: '#334155' }}>
            A page crashed while rendering. The details below will help us fix it quickly.
          </p>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              padding: 12,
              borderRadius: 8,
              background: '#0b1220',
              color: '#e2e8f0',
              fontSize: 12,
              lineHeight: 1.5,
              overflow: 'auto',
            }}
          >
            {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
          </pre>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            style={{
              marginTop: 12,
              padding: '10px 12px',
              borderRadius: 10,
              background: '#da251d',
              color: '#fff',
              fontWeight: 700,
            }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

