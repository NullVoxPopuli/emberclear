import { module, test } from 'qunit';

import { inLocalStorage } from 'ember-tracked-local-storage';

/**
 * When using @inLocalStorage,
 * anything stored in there from this decorator is considered private.
 */
module('Unit | inLocalStorage', function (hooks) {
  hooks.afterEach(function () {
    localStorage.clear();
  });

  test('starts with no initial value', function (assert) {
    class Foo {
      @inLocalStorage bar?: number;
    }

    let foo = new Foo();

    assert.equal(localStorage.getItem('Foo-bar'), null);

    foo.bar = 2;

    assert.equal(localStorage.getItem('Foo-bar'), storedValueOf(2));
  });

  test('starts with a pre-existing value', function (assert) {
    localStorage.setItem('Foo-bar', storedValueOf(2));

    class Foo {
      @inLocalStorage bar?: number;
    }

    let foo = new Foo();

    assert.equal(foo.bar, 2);

    foo.bar = 3;

    assert.equal(localStorage.getItem('Foo-bar'), storedValueOf(3));

    assert.equal(foo.bar, 3);
  });

  test('handles any data type that is serializable via JSON', function (assert) {
    class Foo {
      @inLocalStorage num?: number;
      @inLocalStorage str?: string;
      @inLocalStorage bool?: boolean;
      @inLocalStorage numberArray?: number[];
      @inLocalStorage stringArray?: string[];
      @inLocalStorage complex?: unknown;
    }

    let foo: Foo | undefined;

    foo = new Foo();

    let fixtureData = {
      num: 1,
      str: 'hi',
      bool: true,
      numberArray: [1, 3],
      stringArray: ['hello', 'there'],
      complex: {
        arr: [1, 2, 'string', true, false],
        nested: {
          obj: true,
        },
      },
    };

    foo.num = fixtureData.num;
    foo.str = fixtureData.str;
    foo.bool = fixtureData.bool;
    foo.numberArray = fixtureData.numberArray;
    foo.stringArray = fixtureData.stringArray;
    foo.complex = fixtureData.complex;

    assert.equal(localStorage.getItem('Foo-num'), storedValueOf(fixtureData.num));
    assert.equal(localStorage.getItem('Foo-str'), storedValueOf(fixtureData.str));
    assert.equal(localStorage.getItem('Foo-bool'), storedValueOf(fixtureData.bool));
    assert.equal(localStorage.getItem('Foo-numberArray'), storedValueOf(fixtureData.numberArray));
    assert.equal(localStorage.getItem('Foo-stringArray'), storedValueOf(fixtureData.stringArray));
    assert.equal(localStorage.getItem('Foo-complex'), storedValueOf(fixtureData.complex));

    // Get a new instance so that the loading logic needs to apply
    foo = undefined;
    foo = new Foo();

    assert.equal(foo.num, fixtureData.num);
    assert.equal(foo.str, fixtureData.str);
    assert.equal(foo.bool, fixtureData.bool);
    assert.deepEqual(foo.numberArray, fixtureData.numberArray);
    assert.deepEqual(foo.stringArray, fixtureData.stringArray);
    assert.deepEqual(foo.complex, fixtureData.complex);
  });
});

function storedValueOf(value: unknown) {
  return JSON.stringify({ value });
}
