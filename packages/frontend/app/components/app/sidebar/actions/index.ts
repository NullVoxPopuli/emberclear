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
    //TODO: remove dummy code and implement
    const name = 'user1';
    const { publicKey } = await generateAsymmetricKeys();
    const { publicSigningKey, privateSigningKey } = await generateSigningKeys();
    const id = toHex(publicKey);

    const defaultAttributes = { id, publicKey, publicSigningKey, privateSigningKey };

    const record = this.store.createRecord('user', {
      name,
      ...defaultAttributes,
    });

    let user1 = record;
    let userToAdd = record;

    let currentVote = this.store.createRecord('vote-chain', {
      yes: [],
      no: [],
      remaining: [user1],
      action: VOTE_ACTION.ADD,
      target: userToAdd,
      key: user1,
      previousVoteChain: undefined,
      signature: undefined,
    });

    currentVote.signature = await sign(
      await hash(generateSortedVote(currentVote)),
      user1.privateSigningKey
    );

    this.store.createRecord('action', {
      vote: currentVote,
      response: ACTION_RESPONSE.NONE,
      timestamp: Date.now(),
    });
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
