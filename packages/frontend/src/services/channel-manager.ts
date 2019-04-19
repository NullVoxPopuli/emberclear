import DS from 'ember-data';
import Service from '@ember/service';
import { run } from '@ember/runloop';
import { inject as service } from '@ember/service';

import Channel from 'emberclear/data/models/channel';
import ArrayProxy from '@ember/array/proxy';

export default class ChannelManager extends Service {
  @service store!: DS.Store;

  async findOrCreate(id: string, name: string): Promise<Channel> {
    return await run(async () => {
      try {
        return await this.findAndSetName(id, name);
      } catch (e) {
        return await this.create(id, name);
      }
    });
  }

  async findAndSetName(id: string, name: string): Promise<Channel> {
    let record = await this.find(id);

    record.set('name', name);

    await record.save();

    return record;
  }

  async create(id: string, name: string): Promise<Channel> {
    let record = this.store.createRecord('channel', { id, name });

    await record.save();

    return record;
  }

  async allChannels(): Promise<ArrayProxy<Channel>> {
    const channels = await this.store.findAll('channel');

    return channels;
  }

  async find(uid: string) {
    return await this.store.findRecord('channel', uid);
  }
}
