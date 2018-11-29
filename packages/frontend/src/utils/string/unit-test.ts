import { module, test } from 'qunit';
import * as string from './utils';

module('Unit | Utility | string', function() {
  module('parseURLS', function() {
    test('parses one URL', function(assert) {
      const url = 'https://github.com/emberjs/rfcs/blob/master/text/0143-module-unification.md';
      const input = `sometext something ${url}`;
      const expected = [url];
      const result = string.parseURLs(input);

      assert.deepEqual(result, expected);
    });

    test('parses two URLs', function(assert) {
      const url1 = 'https://github.com/emberjs/rfcs/blob/master/text/0143-module-unification.md';
      const url2 =
        'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace';
      const input = `sometext something ${url1} sometheng else ${url2}`;
      const expected = [url1, url2];
      const result = string.parseURLs(input);

      assert.deepEqual(result, expected);
    });
  });

  module('parseLanguages', function() {
    test('parses code content', function(assert) {
      const input = '```hbs {{some-helper}}```';
      const expected = ['hbs'];
      const result = string.parseLanguages(input);

      assert.deepEqual(result, expected);
    });

    test('parses code in the middle of text', function(assert) {
      const input = `
        some text
        \`\`\`hbs
        <SomeComponent @argument={{value}} />
        \`\`\`
      `;
      const expected = ['hbs'];
      const result = string.parseLanguages(input);

      assert.deepEqual(result, expected);
    });

    test('parses multiple languages from large text', function(assert) {
      const input = `
        some text
        blah blah blah

        something else
        \`\`\`ts
        export default class extends Component {
          someProperty!: boolean;
        }
        \`\`\`
        \`\`\`hbs
        <SomeComponent @argument={{value}} />
        \`\`\`
      `;
      const expected = ['ts', 'hbs'];
      const result = string.parseLanguages(input);

      assert.deepEqual(result, expected);
    });
  });
});
