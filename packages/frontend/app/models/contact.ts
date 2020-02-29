import { attr } from '@ember-data/model';
import Identity from './identity';

export const Status = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
  BUSY: 'busy',
} as const;

type StatusKeys = keyof typeof Status;
type STATUS = typeof Status[StatusKeys];

export default class Contact extends Identity {
  @attr() onlineStatus?: STATUS;
  @attr() isPinned?: boolean;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    contact: Contact;
  }
}
