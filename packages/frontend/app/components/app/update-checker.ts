import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import RouterService from '@ember/routing/router-service';
import { setComponentTemplate } from '@ember/component';
import { hbs } from 'ember-cli-htmlbars';

class UpdateChecker extends Component {
  @service router!: RouterService;

  @reads('router.currentURL') currentURL!: string;
}

// add @hasUpdate={{true}} to test manually
export default setComponentTemplate(
  hbs`
  <ServiceWorkerUpdateNotify>
    <a
      class='service-worker-update-notify alert alert-info has-shadow'
      href={{this.currentURL}}
      style='z-index: 100;'
    >
      {{t 'status.updateAvailable'}}
    </a>
  </ServiceWorkerUpdateNotify>
`,
  UpdateChecker
);
