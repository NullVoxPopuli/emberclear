import '@emberclear/questionably-typed/overrides';

import 'ember-concurrency-decorators';
import 'ember-concurrency-async';
import 'ember-concurrency-ts/async';
import 'ember-concurrency-test-waiter';

import '@emberclear/networking/type-support';

declare module '@ember/component' {
    export function setComponentTemplate(template: any, klass: any): any;
}
