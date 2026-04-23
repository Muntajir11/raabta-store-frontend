import type { ReactNode } from 'react';
import { useEffect } from 'react';
import './PolicyPage.css';

export function PolicyPage({
  title,
  updatedOn,
  children,
}: {
  title: string;
  updatedOn?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="policy">
      <div className="policy-wrap">
        <div className="policy-head">
          <h1 className="policy-title">{title}</h1>
          {updatedOn ? <p className="policy-meta">Last updated: {updatedOn}</p> : null}
        </div>
        <div className="policy-card">
          <div className="policy-body">{children}</div>
        </div>
      </div>
    </div>
  );
}

