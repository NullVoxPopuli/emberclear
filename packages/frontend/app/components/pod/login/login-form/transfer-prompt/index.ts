import Component from '@glimmer/component';
import { getOwner } from '@ember/application';
import { computed } from '@ember/object';

import { dropTask } from 'ember-concurrency-decorators';

import { taskFor } from 'emberclear/utils/ember-concurrency';
import { ReceiveDataConnection } from 'emberclear/services/connection/receive-data-connection';

export default class TransferPrompt extends Component<{}> {
  constructor(owner: unknown, args: {}) {
    super(owner, args);

    taskFor(this.setupEphemeralConnection).perform();
  }

  get verification() {
    return this.result?.verification;
  }

  get qrData() {
    return this.result?.qrData;
  }

  get isLoading() {
    return taskFor(this.setupEphemeralConnection).isRunning;
  }

  @computed('setupEphemeralConnection.lastSuccessful.value')
  get result() {
    return taskFor(this.setupEphemeralConnection).lastSuccessful?.value;
  }

  @dropTask
  *setupEphemeralConnection() {
    let ephemeralConnection = yield ReceiveDataConnection.build(getOwner(this));

    let { hexId: pub } = ephemeralConnection;
    let verification = randomFourLetters();

    let qrData = ['login', { pub, verify: verification }];

    ephemeralConnection.wait();

    return { qrData, ephemeralConnection, verification };
  }

  willDestroy() {
    this.result?.ephemeralConnection?.destroy();

    super.willDestroy();
  }
}

function randomFourLetters() {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(0, 4)
    .toUpperCase();
}
