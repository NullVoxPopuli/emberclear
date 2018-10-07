import DS from 'ember-data';
import Service from '@ember/service';
import { service } from '@ember-decorators/service';

import IdentityService from 'emberclear/services/identity/service';
import { MESSAGE_TYPE } from 'emberclear/src/data/models/message';
import Identity from 'emberclear/src/data/models/identity/model';

export default class MessageFactory extends Service {
  @service store!: DS.Store;
  @service identity!: IdentityService;

  buildChat(text: string) {
    return this._build({
      body: text,
      type: MESSAGE_TYPE.CHAT
    });
  }

  buildWhisper(text: string, to: Identity) {
    return this._build({
      body: text,
      to: to.uid,
      type: MESSAGE_TYPE.WHISPER
    });
  }

  _build(attributes = {}) {
    return this.store.createRecord('message', {
      sentAt: new Date(),
      from: this.identity.uid,
      sender: this.identity.record,
      ...attributes
    });
  }
}


// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'messages/factory': MessageFactory
  }
}
