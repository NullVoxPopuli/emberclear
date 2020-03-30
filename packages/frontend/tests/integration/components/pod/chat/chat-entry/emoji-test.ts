import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';
import { getStore } from 'emberclear/tests/helpers';
import { TestContext } from 'ember-test-helpers';

import { stripIndent } from 'common-tags';

import { page } from 'emberclear/tests/helpers/pages/chat';

module('Integration | Component | chat-entry', function (hooks) {
  setupRenderingTest(hooks);

  module('emoji code replacement', function () {
    hooks.beforeEach(async function (this: TestContext) {
      const store = getStore();

      this.setProperties({
        contact: store.createRecord('contact', { name: 'test' }),
      });

      await render(hbs`<Pod::Chat::ChatEntry @to={{this.contact}} />`);
    });

    module('there are no emoji codes to replace', function () {
      test('result does not contain emoji', async function (assert) {
        const expected = 'This is a test string with no emoji codes to replace.';
        await page.textarea.fillIn(expected);

        assert.equal(page.textarea.value, expected);
      });

      test('emoji codes are not replaced when not between colons', async function (assert) {
        const expected = 'scream smile heartheart heart wave';
        await page.textarea.fillIn(expected);

        assert.equal(page.textarea.value, expected);
      });
    });

    module('there are emoji codes to replace', function () {
      test('result contains emoji', async function (assert) {
        await page.textarea.fillIn(stripIndent`
          This is a test string with emoji codes to replace. :smile:
          The quick :b:rown fox jumps over the lazy dog.
          A :dog: and a :cat: napped.
          ¡:b::a::m:!
        `);

        const expectedString = stripIndent`
          This is a test string with emoji codes to replace. 😄
          The quick 🅱️rown fox jumps over the lazy dog.
          A 🐶 and a 🐱 napped.
          ¡🅱️🅰️Ⓜ️!
        `;

        assert.equal(page.textarea.value, expectedString);
      });

      test('there are multiple transformations of text', async function (assert) {
        await page.textarea.typeIn('A :dog:');
        assert.equal(page.textarea.value, 'A 🐶');

        await page.textarea.typeIn(' and a :cat: napped.');
        assert.equal(page.textarea.value, 'A 🐶 and a 🐱 napped.');
      });
    });
  });
});
