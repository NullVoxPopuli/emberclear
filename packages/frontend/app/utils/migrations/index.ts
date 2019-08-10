import ApplicationInstance from '@ember/application/instance';

import { up as v1Tov2 } from 'emberclear/utils/migrations/v1-to-v2';

export async function runMigrations(appInstance: ApplicationInstance) {
  await v1Tov2(appInstance);
}
