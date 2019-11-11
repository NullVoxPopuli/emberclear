import { module, test, skip } from 'qunit';
import { visit, currentURL, settled, waitFor, triggerEvent } from '@ember/test-helpers';
import { timeout } from 'ember-concurrency';
import { setupApplicationTest } from 'ember-qunit';
import { percySnapshot } from 'ember-percy';

import {
  clearLocalStorage,
  setupRelayConnectionMocks,
  setupCurrentUser,
  getService,
  visit as visitIgnoringFailure,
} from 'emberclear/tests/helpers';

import { page, selectors } from 'emberclear/tests/helpers/pages/chat';
import { createContact } from 'emberclear/tests/helpers/factories/contact-factory';
import Contact from 'emberclear/models/contact';
import { waitUntil } from '@ember/test-helpers';
import { toast } from 'emberclear/tests/helpers/pages/toast';
import { createMessage } from 'emberclear/tests/helpers/factories/message-factory';
import Message from 'emberclear/models/message';

module('Acceptance | Chat | Privately With', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);

  module('is not logged in', function(hooks) {
    hooks.beforeEach(async function() {
      await visit('/chat/privately-with');
    });

    test('document.title is unchanged', async function(assert) {
      assert.ok(document.title.startsWith('emberclear'));
    });
  });

  module('is logged in', function(hooks) {
    setupCurrentUser(hooks);

    module('anyone', async function(hooks) {
      setupRelayConnectionMocks(hooks);

      hooks.beforeEach(async function() {
        await visit('/chat/privately-with');
      });

      test('document.title is properly changed', async function(assert) {
        assert.notEqual(document.title, 'emberclear');
        assert.ok(document.title.startsWith('0 | emberclear | '));
      });
    });

    module('yourself', function(hooks) {
      setupRelayConnectionMocks(hooks);

      hooks.beforeEach(async function() {
        await visit('/chat/privately-with/me');
      });

      test('page renders with default states', function(assert) {
        assert.equal(currentURL(), '/chat/privately-with/me');

        assert.notOk(page.textarea.isDisabled, 'textarea is enabled');
        assert.equal(page.submitButton.isDisabled, 'disabled', 'submit button is disabled');
        assert.equal(page.messages.length, 0, 'history is blank');
      });

      test('there are 0 messages to start with', function(assert) {
        assert.equal(page.messages.length, 0);
      });

      module('text is entered', function(hooks) {
        hooks.beforeEach(async function() {
          await page.textarea.fillIn('a message');
        });

        test('the chat button is not disabled', function(assert) {
          assert.notOk(page.submitButton.isDisabled);
        });

        module('submit is clicked', function(hooks) {
          hooks.beforeEach(async function() {
            page.submitButton.click();
            await waitFor(selectors.submitButton + '[disabled]');
          });

          test('inputs are disabled', function(assert) {
            // assert.equal(chat.messages.all().length, 0, 'history is blank');
            // assert.ok(chat.textarea.isDisabled(), 'textarea is disabled');
            assert.equal(page.submitButton.isDisabled, 'disabled', 'submitButton is disabled');

            percySnapshot(assert as any);
          });
        });

        module('enter is pressed', function(hooks) {
          hooks.beforeEach(async function() {
            triggerEvent(selectors.form, 'submit');
            await waitFor(selectors.submitButton + '[disabled]');
          });

          test('inputs are disabled', function(assert) {
            assert.equal(page.submitButton.isDisabled, 'disabled', 'submitButton is disabled');

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
        await toast.waitForToast();

        assert.equal(currentURL(), '/chat');
      });

      test('a message is displayed', async function(assert) {
        await toast.waitForToast();

        assert.contains(toast.text, 'not be located');

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
          assert.equal(page.messages.length, 0);
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
              let { confirmations } = page.messages.objectAt(0)!;

              assert.ok(confirmations.isLoading, 'a loader is rendererd');
              assert.notContains(confirmations.text, 'could not be delivered');

              percySnapshot(assert as any);

              await settled();
            });
          });

          module('the view has settled', function(hooks) {
            hooks.beforeEach(async function() {
              // waiting on network stuff
              // impossible to tie in to test waiters
              await waitUntil(() => page.messages.objectAt(0)!.confirmations.isLoading);
              await settled();
            });

            test('there is 1 message in the history window', function(assert) {
              assert.equal(page.messages.length, 1);
            });

            test('the message is shown, but with an error', function(assert) {
              let { confirmations } = page.messages.objectAt(0)!;

              assert.notOk(confirmations.isLoading, 'loader is no longer present');
              assert.ok(confirmations.text.includes('could not be delivered'));

              percySnapshot(assert as any);
            });

            module('resend is clicked', function() {
              skip('implement tests for resending');
            });

            module('auto-resend is clicked', function(hooks) {
              hooks.beforeEach(async function() {
                // eslint-disable-next-line no-console
                await page.messages.objectAt(0)!.confirmations.autosend();
              });

              test('the message is queued for resend', async function(assert) {
                const store = getService('store');
                const messages = await store.query('message', { queueForResend: true });

                assert.equal(messages.length, 1, 'there should only be one queued message');

                percySnapshot(assert as any);
              });

              test('the confirmation action area shows that autosend is now pending', function(assert) {
                const text = page.messages.objectAt(0)!.confirmations.text;

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
            let { confirmations } = page.messages.objectAt(0)!;

            assert.ok(confirmations.isLoading, 'a loader is rendererd');
            assert.notContains(confirmations.text, 'could not be delivered');

            percySnapshot(assert as any);
          });
        });

        module('the view has been settled', function(hooks) {
          hooks.beforeEach(async function() {
            await settled();
          });

          test('there is 1 message in the history window', function(assert) {
            assert.equal(page.messages.length, 1);

            percySnapshot(assert as any);
          });

          module('a confirmation is received', function() {
            skip('the message is shown, with successful confirmation', function() {});
          });
        });
      });

      module('scrolling', function(hooks) {
        setupRelayConnectionMocks(hooks);

        let firstMessage: Message;
        let lastMessage: Message;

        module('there are no messages', function(hooks) {
          hooks.beforeEach(async function() {
            await visit(`/chat/privately-with/${id}`);
          });

          test('UI elements are configured appropriately', function(assert) {
            assert.equal(page.isScrollable(), false, 'is not scrollable');
            assert.equal(
              page.newMessagesFloater.isHidden,
              true,
              'new messages floater is not shown'
            );
          });
        });

        module('there are many messages', function(hooks) {
          hooks.beforeEach(async function(assert) {
            let currentUser = getService('currentUser').record!;

            let numMessages = 30;
            for (let i = 0; i < numMessages; i++) {
              let message = await createMessage(someone, currentUser, 'Test Message');

              if (i === 0) {
                firstMessage = message;
              }
              if (i === numMessages - 1) {
                lastMessage = message;
              }
            }

            let store = getService('store');
            let messages = store.peekAll('message');

            assert.equal(messages.length, numMessages, 'messages are created');

            await visit(`/chat/privately-with/${id}`);
          });

          test('most recent messages are shown', async function(assert) {
            assert.equal(page.isScrollable(), true, 'is scrollable');
            assert.equal(
              page.newMessagesFloater.isHidden,
              true,
              'more messages below is not visible'
            );

            assert.ok(page.messages.length < 30, 'not all messages are shown');

            assert.dom(`[data-id="${firstMessage.id}"]`).doesNotExist();
            assert.dom(`[data-id="${lastMessage.id}"]`).exists();
          });

          module('after scrolling up a bit', function(hooks) {
            hooks.beforeEach(async function() {
              page.scroll(-400);
              // for animations
              await timeout(200);
              await settled();
            });

            test('the more messages floater is visible', function(assert) {
              assert.equal(page.newMessagesFloater.isHidden, false);
            });
          });
        });
      });
    });
  });
});
