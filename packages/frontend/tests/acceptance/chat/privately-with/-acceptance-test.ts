import { module, test, skip } from 'qunit';
import StoreService from 'ember-data/store';
import { visit, currentURL, settled, waitFor, triggerEvent } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { percySnapshot } from 'ember-percy';

import {
  clearLocalStorage,
  setupRelayConnectionMocks,
  setupCurrentUser,
  getService,
  clearToasts,
  visit as visitIgnoringFailure,
} from 'emberclear/tests/helpers';

import { chat, page, selectors } from 'emberclear/tests/helpers/pages/chat';
import { app } from 'emberclear/tests/helpers/pages/app';
import { createContact } from 'emberclear/tests/helpers/factories/contact-factory';
import Contact from 'emberclear/models/contact';

module('Acceptance | Chat | Privately With', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);
  clearToasts(hooks);

  module('is logged in', function(hooks) {
    setupCurrentUser(hooks);

    module('yourself', function(hooks) {
      setupRelayConnectionMocks(hooks);

      hooks.beforeEach(async function() {
        await visit('/chat/privately-with/me');
      });

      test('page renders with default states', function(assert) {
        assert.equal(currentURL(), '/chat/privately-with/me');

        assert.notOk(chat.textarea.isDisabled(), 'textarea is enabled');
        assert.ok(chat.submitButton.isDisabled(), 'submit button is disabled');
        assert.equal(chat.messages.all().length, 0, 'history is blank');
      });

      test('there are 0 messages to start with', function(assert) {
        const result = chat.messages.all().length;

        assert.equal(result, 0);
      });

      module('text is entered', function(hooks) {
        hooks.beforeEach(async function() {
          await chat.textarea.fillIn('a message');
        });

        test('the chat button is not disabled', function(assert) {
          assert.notOk(chat.submitButton.isDisabled());
        });

        module('submit is clicked', function(hooks) {
          hooks.beforeEach(async function() {
            chat.submitButton.click();
            await waitFor(chat.selectors.submitButton + '[disabled]');
          });

          test('inputs are disabled', function(assert) {
            // assert.equal(chat.messages.all().length, 0, 'history is blank');
            // assert.ok(chat.textarea.isDisabled(), 'textarea is disabled');
            assert.ok(chat.submitButton.isDisabled(), 'submitButton is disabled');

            percySnapshot(assert as any);
          });
        });

        module('enter is pressed', function(hooks) {
          hooks.beforeEach(async function() {
            triggerEvent(chat.selectors.form, 'submit');
            await waitFor(chat.selectors.submitButton + '[disabled]');
          });

          test('inputs are disabled', function(assert) {
            // assert.ok(chat.textarea.isDisabled(), 'textarea is disabled');
            assert.ok(chat.submitButton.isDisabled(), 'submitButton is disabled');

            percySnapshot(assert as any);
          });
        });
      });
    });

    module('someone that does not exist', function(hooks) {
      setupRelayConnectionMocks(hooks);

      hooks.beforeEach(async function() {
        await visitIgnoringFailure('/chat/privately-with/nobody');
      });

      test('redirects', async function(assert) {
        await waitFor(app.selectors.toast);

        assert.equal(currentURL(), '/chat');
      });

      test('a message is displayed', async function(assert) {
        await waitFor(app.selectors.toast);

        const toastText = app.toast()!.textContent;

        assert.ok(
          toastText!.match(/not be located/),
          'toast is displayed saying the user is not found'
        );

        percySnapshot(assert as any);
      });
    });

    module('someone else', function(hooks) {
      let someone!: Contact;
      let id!: string;

      hooks.beforeEach(async function() {
        someone = await createContact('someone else');
        id = someone.id;
      });

      module('when first visiting the page', function(hooks) {
        setupRelayConnectionMocks(hooks);

        hooks.beforeEach(async function() {
          await visit(`/chat/privately-with/${id}`);
        });

        test('does not redirect', function(assert) {
          assert.equal(currentURL(), `/chat/privately-with/${id}`);
        });

        test('there are 0 messages to start with', function(assert) {
          const result = chat.messages.all().length;

          assert.equal(result, 0);
        });
      });

      module('the person is not online', function(hooks) {
        setupRelayConnectionMocks(hooks, {
          send() {
            // this error comes from the relay
            throw {
              reason: `user with id ${id} not found!`,
              to_uid: id,
            };
          },
        });

        hooks.beforeEach(async function() {
          await visit(`/chat/privately-with/${id}`);
        });

        module('a message is sent', function(hooks) {
          hooks.beforeEach(async function() {
            await page.textarea.fillIn('a message');
            page.submitButton.click();
          });

          module('when the message first shows up in the chat history', function(hooks) {
            hooks.beforeEach(async function() {
              await waitFor(selectors.confirmations);
            });

            test('the message is shown, but is waiting for a confirmation', async function(assert) {
              const messages = chat.messages.all();
              const confirmations = chat.messages.confirmationsFor(messages[0]);
              const loader = chat.messages.loaderFor(messages[0]);
              const text = confirmations.map(c => c.innerHTML).join();

              assert.ok(loader, 'a loader is rendererd');
              assert.notOk(text.includes('could not be delivered'), 'no message is rendered yet');

              percySnapshot(assert as any);

              await settled();
            });
          });

          module('the view has settled', function(hooks) {
            hooks.beforeEach(async function() {
              await settled();
            });

            test('there is 1 message in the history window', function(assert) {
              const result = chat.messages.all().length;

              assert.equal(result, 1);
              assert.equal(page.messages.length, 1, 'there is 1 message in the history window');
            });

            test('the message is shown, but with an error', function(assert) {
              const messages = chat.messages.all();
              const confirmations = chat.messages.confirmationsFor(messages[0]);
              const loader = chat.messages.loaderFor(messages[0]);
              const text = confirmations.map(c => c.textContent).join();

              assert.notOk(loader, 'loader is no longer present');
              assert.ok(text.includes('could not be delivered'));

              percySnapshot(assert as any);
            });

            module('resend is clicked', function() {
              skip('implement tests for resending');
            });

            module('auto-resend is clicked', function(hooks) {
              hooks.beforeEach(async function() {
                await page.messages.objectAt(0).confirmations.autosend();
              });

              test('the message is queued for resend', async function(assert) {
                const store = getService<StoreService>('store');
                const messages = await store.query('message', { queueForResend: true });

                assert.equal(messages.length, 1, 'there should only be one queued message');

                percySnapshot(assert as any);
              });

              test('the confirmation action area shows that autosend is now pending', function(assert) {
                const text = page.messages.objectAt(0).confirmations.text;

                assert.notOk(
                  text.match(/resend automatically/),
                  'does not show the resend automatically link'
                );

                assert.ok(text.match(/autosend pending/), 'shows that autosend is pending');
              });
            });
          });
        });
      });

      module('a message is sent to the person', function(hooks) {
        setupRelayConnectionMocks(hooks, {
          send() {
            // should something be asserted here?
          },
        });

        hooks.beforeEach(async function() {
          await visit(`/chat/privately-with/${id}`);
          await page.textarea.fillIn('a message');
          page.submitButton.click();
        });

        module('when the message shows up in the chat history', function(hooks) {
          hooks.beforeEach(async function() {
            await waitFor(selectors.message);
          });

          test('the message is shown, but is waiting for a confirmation', function(assert) {
            const messages = chat.messages.all();
            const confirmations = chat.messages.confirmationsFor(messages[0]);
            const loader = chat.messages.loaderFor(messages[0]);
            const text = confirmations.map(c => c.innerHTML).join();

            assert.ok(loader, 'a loader is rendererd');
            assert.notOk(text.includes('could not be delivered'), 'no message is rendered yet');

            percySnapshot(assert as any);
          });
        });

        module('the view has been settled', function(hooks) {
          hooks.beforeEach(async function() {
            await settled();
          });

          test('there is 1 message in the history window', function(assert) {
            const result = chat.messages.all().length;

            assert.equal(result, 1);

            percySnapshot(assert as any);
          });

          module('a confirmation is received', function() {
            skip('the message is shown, with successful confirmation', function() {});
          });
        });
      });
    });
  });
});
