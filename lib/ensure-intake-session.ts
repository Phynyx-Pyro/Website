// The cookie is HttpOnly: browser code neither reads nor stores its value.
export async function ensureIntakeSession() {
  // Serialize cookie installation across tabs, not just within one component.
  // Never substitute a JS-readable credential for the HttpOnly capability.
  if (!navigator.locks) throw new Error('Please use a current browser to start a secure form session.')
  return navigator.locks.request('phynyx-intake-bootstrap', async () => {
  const response = await fetch('/api/intake-session', {
    method: 'POST', credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' }, body: '{}',
  })
  if (!response.ok) throw new Error('We could not start a secure form session. Please try again.')
  })
}
