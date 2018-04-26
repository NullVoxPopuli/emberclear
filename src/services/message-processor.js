import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default Service.extend({
  // anything which *must* be merged to prototype here
  toast: service('toast'),
  redux: service('redux'),
  relayConnection: service('relay-connection'),
});
