import { module, test } from 'qunit';
import { render, fillIn } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';
import { getStore } from 'emberclear/tests/helpers';

module('Integration | Component | chat-entry', function(hooks) {
  setupRenderingTest(hooks);

  module('emoji code replacement', function() {
    module('there are no emoji codes to replace', function() {
      test('result does not contain emoji', async function(assert) {
        assert.expect(1);

        const store = getStore();
        const testContact = store.createRecord('contact', {name: 'test'});
        this.set('testContact', testContact);
        
        await render(hbs`<Pod::Chat::ChatEntry @to={{this.testContact}} />`);

        const testString = 'This is a test string with no emoji codes to replace.';
        await fillIn('textarea', testString);

        const textArea = this.element.querySelector('textarea')!;
        assert.equal(
          textArea.value,
          testString,
          'string with no emoji codes should not be modified'
        );
      });

      // test('emoji codes are not replaced when not between colons', async function(assert) {
      //   assert.expect(1);
        
      //   const store = getStore();
      //   const testContact = store.createRecord('contact', {name: 'test'});
      //   this.set('testContact', testContact);
        
      //   await render(hbs`<Pod::Chat::ChatEntry @to={{this.testContact}} />`);

      //   const testString = 'scream smile heartheart heart wave';
      //   fillIn('textarea', testString);

      //   const textArea = this.element.querySelector('textarea')!;
      //   assert.equal(
      //     textArea.value,
      //     testString,
      //     'emoji codes that are not between colons should not be replaced'
      //   );
      // });
    });

    module('there are emoji codes to replace', function() {
      test('result contains emoji', async function(assert) {
        assert.expect(1);
        
        const store = getStore();
        let testContact = store.createRecord('contact', {name: 'test'});
        this.set('testContact', testContact);
        
        await render(hbs`<Pod::Chat::ChatEntry @to={{this.testContact}} />`);

        const testString = `
          This is a test string with emoji codes to replace. :smile:
          The quick :b:rown fox jumps over the lazy dog.
          A :dog: and a :cat: napped.
          ¡:b::a::m:!
        `;

        fillIn('textarea', testString);

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
    });
  });
});
