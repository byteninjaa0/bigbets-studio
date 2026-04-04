/**
 * Smooth-scroll an element into view. Uses double rAF so layout (e.g. framer-motion) can settle.
 * Add `scroll-mt-20` / `scroll-mt-24` on targets to clear fixed headers.
 */
export function scrollIntoViewSmooth(
  element: HTMLElement | null | undefined,
  options?: {
    delayMs?: number;
    block?: ScrollLogicalPosition;
  }
): void {
  if (typeof window === 'undefined' || !element) return;

  const { delayMs = 0, block = 'start' } = options ?? {};

  const run = () => {
    element.scrollIntoView({ behavior: 'smooth', block, inline: 'nearest' });
  };

  if (delayMs > 0) {
    window.setTimeout(run, delayMs);
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(run);
  });
}
