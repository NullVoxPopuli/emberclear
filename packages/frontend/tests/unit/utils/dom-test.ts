import { module, test } from 'qunit';
import sinon from 'sinon';

import { isElementWithin, keepInViewPort } from 'emberclear/utils/dom/utils';

module('Unit | Utility | dom', function () {
  let container: any;
  let element: any;
  let getBoundingClientRect: any;
  const rect = {
    top: 0,
    bottom: 10,
    left: 0,
    right: 10,
  };

  module('isElementWithin', function (hooks) {
    hooks.beforeEach(() => {
      container = {
        getBoundingClientRect() {
          return rect;
        },
      };

      getBoundingClientRect = sinon.stub();
      element = { getBoundingClientRect };
    });

    test('clips above container', function (assert) {
      getBoundingClientRect.returns({ top: -1 });

      assert.notOk(isElementWithin(element, container));
    });

    test('clips to the left of the container', function (assert) {
      getBoundingClientRect.returns({ left: -1 });

      assert.notOk(isElementWithin(element, container));
    });

    test('clips to the right of the container', function (assert) {
      getBoundingClientRect.returns({ right: 11 });

      assert.notOk(isElementWithin(element, container));
    });

    test('clips below the container', function (assert) {
      getBoundingClientRect.returns({ bottom: 11 });

      assert.notOk(isElementWithin(element, container));
    });

    test('is within the container', function (assert) {
      getBoundingClientRect.returns({ top: 1, bottom: 9, left: 1, right: 9 });

      assert.ok(isElementWithin(element, container));
    });

    test('overlaps the container', function (assert) {
      getBoundingClientRect.returns(rect);

      assert.ok(isElementWithin(element, container));
    });
  });

  module('keepInViewPort', function (hooks) {
    let windowWidth!: number;
    let windowHeight!: number;

    hooks.beforeEach(() => {
      windowWidth = window.innerWidth;
      windowHeight = window.innerHeight;

      getBoundingClientRect = sinon.stub();
      element = { getBoundingClientRect, style: {} };
    });

    test('clips above window', function (assert) {
      getBoundingClientRect.returns({ top: -1 });

      keepInViewPort(element);

      assert.equal(element.style.top, '20px');
    });

    test('clips to the left of the window', function (assert) {
      getBoundingClientRect.returns({ left: -1 });

      keepInViewPort(element);

      assert.equal(element.style.left, '20px');
    });

    test('clips to the right of the window', function (assert) {
      getBoundingClientRect.returns({ right: windowWidth + 1 });

      keepInViewPort(element);

      assert.equal(element.style.left, '-21px');
    });

    test('clips below the container', function (assert) {
      getBoundingClientRect.returns({ bottom: windowHeight + 1 });

      keepInViewPort(element);

      assert.equal(element.style.bottom, '20px');
    });

    test('is within the container', function (assert) {
      getBoundingClientRect.returns({ top: 1, bottom: 9, left: 1, right: 9 });

      keepInViewPort(element);

      assert.deepEqual(element.style, {});
    });

    test('overlaps the container', function (assert) {
      getBoundingClientRect.returns(rect);

      keepInViewPort(element);

      assert.deepEqual(element.style, {});
    });
  });
});
