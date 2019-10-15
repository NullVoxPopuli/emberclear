import { module, test } from 'qunit';
import { render, typeIn } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | chat-entry', function(hooks) {
  setupRenderingTest(hooks);

  module('emoji code replacement', function() {
    module('there are no emoji codes to replace', function() {
      test('result does not contain emoji', async function(assert) {
        assert.expect(2);
        await render(hbs`<Pod::Chat::ChatEntry />`);
        const chatEntry = this.element as HTMLElement;

        assert.equal(
          chatEntry.textContent,
          '',
          'The chat entry should initially be empty'
        );

        const testString = 'This is a test string with no emoji codes to replace.';

        typeIn(chatEntry, testString);

        assert.equal(
          chatEntry.textContent,
          testString,
          'A string with no emoji codes should not be modified'
        );
      });
    });

    module('there are emoji codes to replace', function() {
      test('result contains emoji', async function(assert) {
        assert.expect(2);
        await render(hbs`<Pod::Chat::ChatEntry />`);
        const chatEntry = this.element as HTMLElement;

        assert.equal(
          chatEntry.textContent,
          '',
          'The chat entry should initially be empty'
        );

        const testString = `
          This is a test string with emoji codes to replace. :smile:
          The quick :b:rown fox jumped over the lazy dog.
          A :dog: and a :cat:.
          ¡:b::a::m:!
        `;

        typeIn(chatEntry, testString);

        const expectedString = `
          This is a test string with emoji codes to replace. 😄
          The quick 🅱️rown fox jumped over the lazy dog.
          A 🐶 and a 🐱.
          ¡🅱️🅰️Ⓜ️!
        `;

        assert.equal(
          chatEntry.textContent,
          expectedString,
          'A string with emoji codes should be modified correctly'
        );
      });
    });
  });
});
