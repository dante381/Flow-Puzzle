export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const el = document.getElementById('a11y-announcer')
  if (!el) return
  el.setAttribute('aria-live', priority)
  el.textContent = ''
  // Small delay ensures screen readers register the change
  requestAnimationFrame(() => {
    el.textContent = message
  })
}
