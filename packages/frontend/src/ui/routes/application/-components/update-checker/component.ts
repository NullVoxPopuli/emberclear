import Ember from 'ember';
import Component from 'sparkles-component';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';

export default class UpdateChecker extends Component {
  @service router!: Router;

  @reads('router.currentURL') currentURL!: string;

  isEnabled = !Ember.testing;
}
