import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import { inject as service } from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';

import type RouterService from '@ember/routing/router-service';

class UpdateChecker extends Component {
  @service declare router: RouterService;
}

// add @hasUpdate={{true}} to test manually
export default setComponentTemplate(
  hbs`
  <ServiceWorkerUpdateNotify>
    <a
      class='service-worker-update-notify alert alert-info has-shadow'
      href={{this.router.currentURL}}
      style='z-index: 100;'
    >
      {{t 'status.updateAvailable'}}
    </a>
  </ServiceWorkerUpdateNotify>
`,
  UpdateChecker
);
