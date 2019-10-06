import ENV from 'emberclear/config/environment';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import RouterService from '@ember/routing/router-service';

const ONE_MINUTE = 600000;
const FIVE_SECONDS = 5000;

export default class UpdateChecker extends Component {
  @service router!: RouterService;

  @reads('router.currentURL') currentURL!: string;

  interval = ENV.environment === 'development' ? FIVE_SECONDS : ONE_MINUTE;
}
