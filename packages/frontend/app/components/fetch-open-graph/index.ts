import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { setComponentTemplate } from '@ember/component';
import { task } from 'ember-concurrency';
import { hbs } from 'ember-cli-htmlbars';

import Task from 'ember-concurrency/task';
import ConnectionService from 'emberclear/services/connection';
import ConnectionStatusService from 'emberclear/services/connection/status';

type Args = {
  url: string;
};

class FetchOpenGraphComponent extends Component<Args> {
  @service('connection/status') status!: ConnectionStatusService;
  @service('connection') connection!: ConnectionService;

  constructor(owner: any, args: Args) {
    super(owner, args);

    this.request.perform();
  }

  // everything is private API in here.

  @task(function*(this: FetchOpenGraphComponent) {
    // wait for connectivity
    yield waitUntil(() => this.status.isConnected);
    let og = yield this.connection.getOpenGraph(this.args.url);

    return og;
  })
  request!: Task;
}

export default setComponentTemplate(
  hbs`
  {{!--
    <FetchOpenGraph @url={{...}} as |isLoading json error|>

    </FetchOpenGraph>

  --}}
  {{yield
    this.request.isRunning
    this.request.lastSuccessful.value
    this.request.lastErrored.value
  }}
  `,
  FetchOpenGraphComponent
);

function waitUntil(callback: () => boolean): Promise<void> {
  return new Promise(resolve => {
    let interval: number;

    interval = setInterval(() => {
      let result = callback();

      if (result) {
        clearInterval(interval);
        resolve();
      }
    });
  });
}
