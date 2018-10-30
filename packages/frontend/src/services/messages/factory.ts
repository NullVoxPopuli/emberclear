import Service from '@ember/service';
import { service } from '@ember-decorators/service';

import IdentityService from 'emberclear/services/identity/service';
import { TYPE, TARGET } from 'emberclear/src/data/models/message';
import Identity from 'emberclear/src/data/models/identity/model';
import Channel from 'emberclear/src/data/models/channel';

export default class MessageFactory extends Service {
  @service store!: any;
  @service identity!: IdentityService;

  buildChat(text: string, to: Identity | Channel) {
    let attributes = {};

    if (to instanceof Identity) {
      attributes = { target: TARGET.WHISPER, to: to.uid };
    } else if (to instanceof Channel) {
      attributes = { traget: TARGET.CHANNEL, to: to.id };
    }

    let message = this.build({
      body: text,
      type: TYPE.CHAT,
      ...attributes
    });

    return message;
  }

  buildPing() {
    return this.build({ type: TYPE.PING });
  }

  // buildEmote(text: string) {
  //   return this._build({
  //     body: text,
  //     type: TYPE.EMOTE
  //   });
  // }

  private build(attributes = {}) {
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
