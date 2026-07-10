export const WELCOME_CREDITS_STORAGE_KEY = 'cn_welcome_credits_seen';

export function hasSeenWelcomeCredits() {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(WELCOME_CREDITS_STORAGE_KEY) === 'true';
}

export function markWelcomeCreditsSeen() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(WELCOME_CREDITS_STORAGE_KEY, 'true');
  }
}
