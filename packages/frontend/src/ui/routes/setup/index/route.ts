import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

export default class SetupIndexRoute extends Route {

  beforeModel() {
    // immediately redirect to a more semantic route
    this.transitionTo('setup.new');
  }
}
