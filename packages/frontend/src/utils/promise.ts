import EmberObject from '@ember/object';
import PromiseProxyMixin from '@ember/object/promise-proxy-mixin';

export const PromiseProxy = EmberObject.extend(PromiseProxyMixin);
