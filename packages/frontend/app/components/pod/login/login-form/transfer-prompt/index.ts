import Component from '@glimmer/component';
import { computed } from '@ember/object';

import { dropTask } from 'ember-concurrency-decorators';

import { taskFor } from 'emberclear/utils/ember-concurrency';
import { ReceiveDataConnection } from 'emberclear/services/connection/ephemeral/login/receive-data';
import Ember from 'ember';

export default class TransferPrompt extends Component<{}> {
  constructor(owner: unknown, args: {}) {
    super(owner, args);

    if (!Ember.testing) {
      taskFor(this.setupEphemeralConnection).perform();
    }
  }

  get verification() {
    return this.result?.verification;
  }

  get qrData() {
    return this.result?.qrData;
  }

  get taskMessage() {
    let message = taskFor(this.setupEphemeralConnection).lastSuccessful?.value?.ephemeralConnection
      ?.taskMsg;

    return message;
  }

  get isLoading() {
    return Boolean(this.taskMessage);
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
