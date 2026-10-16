/**
 * Agro Easter Egg Trigger Manager
 * Triggers special 20 Agro Quotes celebration upon 7 clicks on GeaAgro logo/icon
 */

let clickCount = 0;
let lastClickTime = 0;
const RESET_TIMEOUT_MS = 3500; // Reset counter if idle for > 3.5 seconds
const TARGET_CLICKS = 7;

export interface EasterEggProgressDetail {
  count: number;
  target: number;
  remaining: number;
}

export const triggerAgroEasterEggModal = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('geaagro:open-agro-easter-egg'));
  }
};

export const handleAgroLogoClick = (e?: React.MouseEvent) => {
  if (e) {
    // If the click is targeted directly for the logo trigger, prevent undesirable immediate navigation if desired or allow it
    // Don't necessarily stop propagation unless user clicks fast
  }

  const now = Date.now();
  if (now - lastClickTime > RESET_TIMEOUT_MS) {
    clickCount = 0;
  }
  lastClickTime = now;
  clickCount += 1;

  if (typeof window !== 'undefined') {
    // Notify about click progress (for subtle visual feedback when >= 3 clicks)
    window.dispatchEvent(
      new CustomEvent<EasterEggProgressDetail>('geaagro:agro-egg-progress', {
        detail: {
          count: clickCount,
          target: TARGET_CLICKS,
          remaining: Math.max(0, TARGET_CLICKS - clickCount),
        },
      })
    );
  }

  if (clickCount >= TARGET_CLICKS) {
    clickCount = 0;
    triggerAgroEasterEggModal();
  }
};
