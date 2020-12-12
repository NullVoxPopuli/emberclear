import Ember from 'ember';
import Component from '@glimmer/component';
import { action } from '@ember/object';

import { dropTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';

import { ReceiveDataConnection } from 'emberclear/services/connection/ephemeral/login/receive-data';

type Args = {
  updateTransferStatus: (status: boolean) => void;
};

export default class TransferPrompt extends Component<Args> {
  constructor(owner: unknown, args: Args) {
    super(owner, args);

    if (!Ember.testing) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      taskFor(this.setupEphemeralConnection).perform();
    }
  }

  get verification() {
    return this.result?.verification;
  }

  get fromUser() {
    return this.result?.ephemeralConnection?.senderName;
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
    return Boolean(this.taskMessage) || !this.result;
  }

  get result() {
    return taskFor(this.setupEphemeralConnection).lastSuccessful?.value;
  }

  @action
  cancel() {
    this.args.updateTransferStatus(false);

    let task = taskFor(this.setupEphemeralConnection);

    // TODO: send CANCEL message to sender
    task.cancelAll();
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    task.perform();
  }

  @dropTask
  async setupEphemeralConnection() {
    let { updateTransferStatus } = this.args;

    let ephemeralConnection: ReceiveDataConnection = await ReceiveDataConnection.build(this);

    let { hexId: pub } = ephemeralConnection;
    let verification = randomFourLetters();

    let qrData = ['login', { pub, verify: verification }];

    ephemeralConnection.wait(updateTransferStatus);

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
