import { ensureRelays } from '@emberclear/networking';

import type ApplicationInstance from '@ember/application/instance';

export async function ensureRequirementsAreMet(owner: ApplicationInstance) {
  await ensureRelays(owner);
}
