import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ApiRequestError,
  authLogout,
  notifyAuthChanged,
  passwordChange,
  profileGet,
  profileUpdate,
  type ProfileUser,
} from '../../lib/api';
import RequireAuth from '../../components/RequireAuth';
import './AccountPages.css';

export default function SettingsPage() {
  return (
    <RequireAuth>
      <SettingsContent />
    </RequireAuth>
  );
}

function SettingsContent() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [prefSaving, setPrefSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const p = await profileGet();
        if (cancelled) return;
        setProfile(p);
        setMarketingOptIn(p.marketingOptIn);
      } catch (err) {
        if (cancelled) return;
        const msg =
          err instanceof ApiRequestError
            ? err.status === 401
              ? 'Please log in again.'
              : err.message
            : 'Could not load settings';
        setLoadError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onMarketingChange(next: boolean) {
    setMarketingOptIn(next);
    setPrefSaving(true);
    try {
      const updated = await profileUpdate({ marketingOptIn: next });
      setProfile(updated);
      notifyAuthChanged();
      toast.success(next ? 'You opted in to updates' : 'Preference saved');
    } catch (err) {
      setMarketingOptIn(!next);
      const msg =
        err instanceof ApiRequestError ? err.message : err instanceof Error ? err.message : 'Update failed';
      toast.error(msg);
    } finally {
      setPrefSaving(false);
    }
  }

  async function onPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPwdError(null);
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setPwdError('New password must be at least 8 characters');
      return;
    }
    setPwdSaving(true);
    try {
      await passwordChange({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      notifyAuthChanged();
      toast.success('Password updated');
    } catch (err) {
      const msg =
        err instanceof ApiRequestError ? err.message : err instanceof Error ? err.message : 'Could not update password';
      setPwdError(msg);
      toast.error(msg);
    } finally {
      setPwdSaving(false);
    }
  }

  async function onLogout() {
    try {
      await authLogout();
      notifyAuthChanged();
      toast.success('Logged out');
    } catch {
      toast.error('Could not log out');
    }
  }

  return (
    <section className="cart-page">
      <div className="container">
        <div className="cart-header-row">
          <h2 className="cart-title">Settings</h2>
        </div>

        {loading ? (
          <p className="cart-state">Loading…</p>
        ) : loadError && !profile ? (
          <p className="cart-error" role="alert">
            {loadError}
          </p>
        ) : (
          <>
            <div className="account-card">
              <h3 className="account-card-title">Email updates</h3>
              <div className="account-toggle-row">
                <label htmlFor="marketing-opt">Product news & offers</label>
                <input
                  id="marketing-opt"
                  type="checkbox"
                  className="account-toggle"
                  checked={marketingOptIn}
                  disabled={prefSaving || !profile}
                  onChange={(e) => void onMarketingChange(e.target.checked)}
                />
              </div>
              <p className="account-hint">We will only email you about Raabta launches and promotions.</p>
            </div>

            <form className="account-card" onSubmit={(e) => void onPasswordSubmit(e)}>
              <h3 className="account-card-title">Change password</h3>
              {pwdError ? (
                <p className="account-error" role="alert">
                  {pwdError}
                </p>
              ) : null}
              <div className="account-form">
                <div className="account-field">
                  <label htmlFor="pwd-current">Current password</label>
                  <input
                    id="pwd-current"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={pwdSaving}
                    required
                  />
                </div>
                <div className="account-field">
                  <label htmlFor="pwd-new">New password</label>
                  <input
                    id="pwd-new"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={pwdSaving}
                    required
                    minLength={8}
                  />
                </div>
                <div className="account-field">
                  <label htmlFor="pwd-confirm">Confirm new password</label>
                  <input
                    id="pwd-confirm"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={pwdSaving}
                    required
                    minLength={8}
                  />
                </div>
                <div className="account-actions">
                  <button type="submit" className="account-submit" disabled={pwdSaving}>
                    {pwdSaving ? 'Updating…' : 'Update password'}
                  </button>
                </div>
              </div>
            </form>

            <div className="account-card">
              <h3 className="account-card-title">Session</h3>
              <div className="account-actions">
                <button type="button" className="account-submit account-logout" onClick={() => void onLogout()}>
                  Log out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
