import Ember from 'ember';
import Component from 'sparkles-component';
import { service } from '@ember-decorators/service';
import { reads } from '@ember-decorators/object/computed';

export default class UpdateChecker extends Component {
  @service router!: Router;

  @reads('router.currentURL') currentURL!: string;

  isEnabled = !Ember.testing;
}
