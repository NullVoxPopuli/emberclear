import Ember from 'ember';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import RouterService from '@ember/routing/router-service';

export default class UpdateChecker extends Component {
  @service router!: RouterService;

  @reads('router.currentURL') currentURL!: string;

  isEnabled = !Ember.testing;
}
