import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { setComponentTemplate } from '@ember/component';
import { task } from 'ember-concurrency-decorators';
import { hbs } from 'ember-cli-htmlbars';

import ConnectionService from 'emberclear/services/connection';
import ConnectionStatusService from 'emberclear/services/connection/status';
import { normalizeMeta } from 'emberclear/utils/normalized-meta';
import { taskFor } from 'ember-concurrency-ts';

type Args = {
  url: string;
};

class FetchOpenGraphComponent extends Component<Args> {
  @service('connection/status') declare status: ConnectionStatusService;
  @service('connection') declare connection: ConnectionService;

  constructor(owner: any, args: Args) {
    super(owner, args);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    taskFor(this.request).perform();
  }

  // everything is private API in here.

  get meta() {
    let { url } = this.args;

    return normalizeMeta({
      url,
      openGraph: taskFor(this.request).lastSuccessful?.value,
    });
  }

  @task({ withTestWaiter: true })
  async request() {
    await waitUntil(() => this.status.isConnected);

    let og = await this.connection.getOpenGraph(this.args.url);

    return og;
  }
}

export default setComponentTemplate(
  hbs`
  {{!--
    <FetchOpenGraph @url={{...}} as |isLoading data|>

    </FetchOpenGraph>

  --}}
  {{yield
    this.request.isRunning
    (hash
      result=this.request.lastSuccessful.value
      error=this.request.lastErrored.value
      meta=this.meta
    )
  }}
  `,
  FetchOpenGraphComponent
);

function waitUntil(callback: () => boolean): Promise<void> {
  return new Promise((resolve) => {
    let interval: any;

    interval = setInterval(() => {
      let result = callback();

      if (result) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
}
