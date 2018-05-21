import DS from 'ember-data';
import Component from '@ember/component';

import { computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';


export default class ChatHistory extends Component {
  @service store!: DS.Store;

}
