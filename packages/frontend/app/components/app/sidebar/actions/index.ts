import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import StoreService from '@ember-data/store';
import SettingsService from 'emberclear/services/settings';
import RouterService from '@ember/routing/router-service';
import Action, { ACTION_RESPONSE } from 'emberclear/models/action';
import CurrentUserService from 'emberclear/services/current-user';
import SidebarService from 'emberclear/services/sidebar';

import { VOTE_ACTION } from 'emberclear/models/vote-chain';
import { generateSortedVote } from 'emberclear/services/channels/-utils/vote-sorter';
import { sign, hash } from 'emberclear/workers/crypto/utils/nacl';

import { toHex } from 'emberclear/utils/string-encoding';
import { generateAsymmetricKeys, generateSigningKeys } from 'emberclear/workers/crypto/utils/nacl';

interface IArgs {
  actions: Action[];
  closeSidebar: () => void;
}

export default class ActionsSidebar extends Component<IArgs> {
  @service currentUser!: CurrentUserService;
  @service settings!: SettingsService;
  @service router!: RouterService;
  @service store!: StoreService;
  @service sidebar!: SidebarService;

  get allActions(): Action[] {
    //TODO: filter to only current channel
    return this.store
      .peekAll('action')
      .toArray()
      .filter((action) => action.response !== ACTION_RESPONSE.DISMISSED);
  }

  get newActions(): Action[] {
    return this.allActions.sort(sortByOldest);
  }

  @action
  async addAction() {
    //TODO: Construct a new action, add to the store, and broadcast 
  }
}

function sortByOldest(action1: Action, action2: Action) {
  if (action1.timestamp < action2.timestamp) {
    return 1;
  }
  if (action1.timestamp > action2.timestamp) {
    return -1;
  }
  return 0;
}
