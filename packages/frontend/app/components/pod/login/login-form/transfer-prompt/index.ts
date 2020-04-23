import Component from '@glimmer/component';
import { computed } from '@ember/object';

import { dropTask } from 'ember-concurrency-decorators';

import { taskFor } from 'emberclear/utils/ember-concurrency';
import { ReceiveDataConnection } from 'emberclear/services/connection/ephemeral/login/receive-data';

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
    let ephemeralConnection = yield ReceiveDataConnection.build(this);

    let { hexId: pub } = ephemeralConnection;
    let verification = randomFourLetters();

    let qrData = ['login', { pub, verify: verification }];

    // TODO: need to have UI feedback here... as importing can be kinda slow.
    //       - do I let a state machine be in charge of importing?
    //       - should the importing behavior be pulled out of settings?
    ephemeralConnection.wait();

    return { qrData, ephemeralConnection, verification };
  }
}

function randomFourLetters() {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(0, 4)
    .toUpperCase();
}
