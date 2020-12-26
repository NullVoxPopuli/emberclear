import type Contact from './models/contact';

export function isContact(maybe: unknown): maybe is Contact {
  if (typeof maybe !== 'object') return false;
  if (!maybe) return false;

  return 'isPinned' in maybe;
}
