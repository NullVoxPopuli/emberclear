import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import Identity from 'emberclear/data/models/identity/model';


export default class extends Controller {
  @action
  remove(identity: Identity) {
    identity.destroyRecord();
    identity.save();
  }
}
