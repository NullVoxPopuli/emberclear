import '@emberclear/questionably-typed/overrides';

import 'ember-concurrency-decorators';
import 'ember-concurrency-async';
import 'ember-concurrency-ts/async';
import 'ember-concurrency-test-waiter';

import '@emberclear/networking/type-support';

declare module 'ember-concurrency-test-waiter/define-modifier' {
  const foo: any;
  export default foo;
}
