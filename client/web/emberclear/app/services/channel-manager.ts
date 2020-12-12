import Service from '@ember/service';
import { inject as service } from '@ember/service';

import type ArrayProxy from '@ember/array/proxy';
import type StoreService from '@ember-data/store';
import type Channel from 'emberclear/models/channel';

export default class ChannelManager extends Service {
  @service declare store: StoreService;

  async findOrCreate(id: string, name: string): Promise<Channel> {
    try {
      return await this.findAndSetName(id, name);
    } catch (e) {
      return await this.create(id, name);
    }
  }

  async findAndSetName(id: string, name: string): Promise<Channel> {
    let record = await this.find(id);

    record.name = name;

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
