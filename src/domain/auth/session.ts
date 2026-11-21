/**
 * The account chosen on the login screen for the current desktop session.
 *
 * Login screens are theme-local and call onLogin() without arguments, so the
 * chosen account is recorded here before onLogin(). The desktop reads it to show
 * the right name in shell surfaces such as the Windows 7 Start menu. sessionStorage
 * keeps it across a reload of the same tab; every access is guarded because
 * private windows and blocked storage can throw.
 */
export type SessionAccountName = 'User' | 'C4m1r';

const STORAGE_KEY = 'webos-session-account';
const DEFAULT_ACCOUNT: SessionAccountName = 'User';

let current: SessionAccountName | null = null;

export function setSessionAccount(name: SessionAccountName) {
  current = name;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, name);
  } catch {
    // Storage unavailable: the in-memory value still serves this page view.
  }
}

export function getSessionAccount(): SessionAccountName {
  if (current) return current;
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored === 'User' || stored === 'C4m1r') {
      current = stored;
      return stored;
    }
  } catch {
    // Fall through to the default account.
  }
  return DEFAULT_ACCOUNT;
}
