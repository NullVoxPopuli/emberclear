import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import { stripIndent } from 'common-tags';

import {
  visit,
  clearLocalStorage,
  setupRelayConnectionMocks,
  setupCurrentUser,
  setupWorkers,
} from 'emberclear/tests/helpers';

import { page } from 'emberclear/tests/helpers/pages/chat';
import { createContact } from 'emberclear/tests/helpers/factories/contact-factory';
import type Contact from 'emberclear/models/contact';

let codeA = stripIndent`
  \`\`\`ts
  let forA = 2;
  \`\`\`
`;

let codeB = stripIndent`
  \`\`\`ts
  let forB = 3;
  \`\`\`
`;

async function submitCodeTo(code: string, to: Contact, assert: Assert) {
  await visit(`/chat/privately-with/${to.id}`);
  await page.textarea.fillIn(code);
  await page.submitButton.click();

  let { hasCode } = page.messages.objectAt(0)!;

  assert.ok(hasCode, `code for ${to.name} is present`);
}

module('Acceptance | Chat | Privately With | format-code', function (hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);
  setupWorkers(hooks);

  module('is logged in with two contacts', function (hooks) {
    setupCurrentUser(hooks);
    setupRelayConnectionMocks(hooks, {
      send() {
        // should something be asserted here?
      },
    });

    let contactA!: Contact;
    let contactB!: Contact;

    hooks.beforeEach(async function () {
      contactA = await createContact('A Contact A');
      contactB = await createContact('B Contact B');
    });

    module('a message with code is sent to Contact A & B', function (hooks) {
      hooks.beforeEach(async function (assert) {
        await submitCodeTo(codeA, contactA, assert);
        await submitCodeTo(codeB, contactB, assert);
      });

      module('when navigating back to A', function (hooks) {
        hooks.beforeEach(async function () {
          await visit(`/chat/privately-with/${contactA.id}`);
        });

        test('the chat history still renders the code snippet', function (assert) {
          let { hasCode } = page.messages.objectAt(0)!;

          assert.ok(hasCode, 'code for A is present');
        });

        module('when navigating back to B', function (hooks) {
          hooks.beforeEach(async function () {
            await visit(`/chat/privately-with/${contactB.id}`);
          });

          test('the chat history still renders the code snippet', function (assert) {
            let { hasCode } = page.messages.objectAt(0)!;

            assert.ok(hasCode, 'code for B is present');
          });
        });
      });
    });
  });
});
