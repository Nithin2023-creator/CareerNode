const SPLASH_VISIBLE_EVENT = 'cn:splash-visible';
export const SPLASH_COMPLETE_EVENT = 'cn:splash-complete';

export function isSplashSkipped() {
  return !!sessionStorage.getItem('cn_splash_seen');
}

export function setSplashVisible(visible) {
  window.dispatchEvent(new CustomEvent(SPLASH_VISIBLE_EVENT, { detail: { visible } }));
}

export function onSplashVisibleChange(callback) {
  const handler = (event) => callback(event.detail.visible);
  window.addEventListener(SPLASH_VISIBLE_EVENT, handler);
  return () => window.removeEventListener(SPLASH_VISIBLE_EVENT, handler);
}

export function dispatchSplashComplete() {
  window.dispatchEvent(new CustomEvent(SPLASH_COMPLETE_EVENT));
}
