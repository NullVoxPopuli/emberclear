import EmberObject from '@ember/object';
import PromiseProxyMixin from '@ember/object/promise-proxy-mixin';

import DS from 'ember-data';

// export const PromiseProxy = DS.PromiseObject;

export const PromiseProxy = EmberObject.extend(PromiseProxyMixin);
