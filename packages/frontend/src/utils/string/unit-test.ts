import { module, test } from 'qunit';
import * as string from './utils';

module('Unit | Utility | string', function() {
  module('hostFromURL', function() {
    test('finds the host from a URL', function(assert) {
      const url = 'wss://mesh-relay-in-us-1.herokuapp.com/socket';
      const expected = 'mesh-relay-in-us-1.herokuapp.com';
      const result = string.hostFromURL(url);

      assert.equal(result, expected);
    });

    test('when the pattern is not matched, null is returned', function(assert) {
      const url = 'mesh-relay-in-us-1.herokuapp.com/socket';
      const expected = null;
      const result = string.hostFromURL(url);

      assert.equal(result, expected);
    });
  });

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
