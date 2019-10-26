import { module, test } from 'qunit';
import { render, typeIn } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';
import { getStore } from 'emberclear/tests/helpers';
import { TestContext } from 'ember-test-helpers';

module('Integration | Component | chat-entry', function(hooks) {
  setupRenderingTest(hooks);
  
  hooks.beforeEach(async function(this: TestContext) {
    const store = getStore();
    const testContact = store.createRecord('contact', { name: 'test' });
    this.set('testContact', testContact);
    await render(hbs`<Pod::Chat::ChatEntry @to={{this.testContact}} />`);
  });

  module('emoji code replacement', function() {
    module('there are no emoji codes to replace', function() {
      test('result does not contain emoji', async function(assert) {
        assert.expect(1);

        const testString = 'This is a test string with no emoji codes to replace.';
        await typeIn('textarea', testString);

        const textArea = this.element.querySelector('textarea')!;
        assert.equal(
          textArea.value,
          testString,
          'string with no emoji codes should not be modified'
        );
      });

      test('emoji codes are not replaced when not between colons', async function(assert) {
        assert.expect(1);

        const testString = 'scream smile heartheart heart wave';
        await typeIn('textarea', testString);

        const textArea = this.element.querySelector('textarea')!;
        assert.equal(
          textArea.value,
          testString,
          'emoji codes that are not between colons should not be replaced'
        );
      });
    });

    module('there are emoji codes to replace', function() {
      test('result contains emoji', async function(assert) {
        assert.expect(1);

        const testString = `
          This is a test string with emoji codes to replace. :smile:
          The quick :b:rown fox jumps over the lazy dog.
          A :dog: and a :cat: napped.
          ¡:b::a::m:!
        `;

        await typeIn('textarea', testString);

        const textArea = this.element.querySelector('textarea')!;
        const expectedString = `
          This is a test string with emoji codes to replace. 😄
          The quick 🅱️rown fox jumps over the lazy dog.
          A 🐶 and a 🐱 napped.
          ¡🅱️🅰️Ⓜ️!
        `;

        assert.equal(
          textArea.value,
          expectedString,
          'string with emoji codes should be modified correctly'
        );
      });

      test('there are multiple transformations of text', async function(assert) {
        assert.expect(2);
        const textArea = this.element.querySelector('textarea')!;

        const firstTestString = 'A :dog:';
        await typeIn('textarea', firstTestString);
        assert.equal(textArea.value, 'A 🐶');
        
        const secondTestString = ' and a :cat: napped.';
        await typeIn('textarea', secondTestString);
        assert.equal(textArea.value, 'A 🐶 and a 🐱 napped.');
      });
    });
  });
});
