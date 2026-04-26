import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authSession } from '../lib/api';

type Props = {
  children: React.ReactNode;
};

export default function RequireAuth({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'ok'>('loading');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const user = await authSession({ force: true });
      if (cancelled) return;
      if (!user) {
        navigate('/login', { replace: true, state: { from: location } });
        return;
      }
      setStatus('ok');
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, location]);

  if (status === 'loading') {
    return (
      <section className="cart-page">
        <div className="container">
          <p className="cart-state">Loading…</p>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}
