import { module, test, skip } from 'qunit';

import { visit, currentURL, settled, waitFor, waitUntil } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import {
  clearLocalStorage,
  setupRelayConnectionMocks,
  setupCurrentUser,
  getService,
  getStore,
  setupWorkers,
} from 'emberclear/tests/helpers';

import { page, selectors } from 'emberclear/components/app/off-canvas/-page';

import { page as settings } from 'emberclear/tests/helpers/pages/settings';
import { createContact } from 'emberclear/tests/helpers/factories/contact-factory';
import Contact from 'emberclear/models/contact';
import { createMessage } from 'emberclear/tests/helpers/factories/message-factory';
import { getCurrentUser } from 'emberclear/tests/helpers';

module('Acceptance | Sidebar', function (hooks) {
  setupApplicationTest(hooks);
  setupWorkers(hooks);
  clearLocalStorage(hooks);
  setupRelayConnectionMocks(hooks);
  setupCurrentUser(hooks);

  let t: Intl['t'];

  hooks.beforeEach(async function () {
    await visit('/chat');
    await page.toggle();

    let intl = getService('intl');

    t = intl.t.bind(intl);
  });

  module('Tabs', function (hooks) {
    hooks.beforeEach(async function () {
      await visit('/chat?_features=democracy-ui');
    });

    test('default tab is contacts', function (assert) {
      let content = page.sidebar.header.text;

      assert.equal(content, t('ui.sidebar.contacts.title'));
    });

    module('switch tab to channels', function (hooks) {
      hooks.beforeEach(async function () {
        await page.sidebar.selectChannelsTab();
      });

      test('channels tab is displayed', async function (assert) {
        let content = page.sidebar.header.text;

        assert.equal(content, t('ui.sidebar.channels.title'));
      });
    });

    module('switch tab to actions', function (hooks) {
      hooks.beforeEach(async function () {
        await page.sidebar.selectActionsTab();
      });

      test('actions tab is displayed', async function (assert) {
        let content = page.sidebar.header.text;

        assert.equal(content, t('ui.sidebar.actions.title'));
      });
    });

    module('switch tab to contacts', function (hooks) {
      hooks.beforeEach(async function () {
        await page.sidebar.selectContactsTab();
      });

      test('contacts tab is displayed', function (assert) {
        let content = page.sidebar.contacts.header.text;

        assert.equal(content, t('ui.sidebar.contacts.title'));
      });
    });
  });

  module('Search', function () {
    module('There are contacts', function (hooks) {
      let contacts!: Contact[];

      hooks.beforeEach(async function () {
        contacts = [
          await createContact('Contact AA'),
          await createContact('Contact BB'),
          await createContact('Contact BBC'),
        ];
      });

      test('all contacts are visible', function (assert) {
        assert.expect(3);

        let content = page.sidebar.contacts.listText;

        for (let contact of contacts) {
          assert.contains(content, contact.name);
        }
      });

      module('1 letter is entered', function (hooks) {
        hooks.beforeEach(async function () {
          await page.sidebar.search('A');
        });

        test('help text is shown', function (assert) {
          assert.contains(page.sidebar.searchInfo, t('ui.sidebar.keepTyping', { num: 1 }));
        });

        test('all contacts are still visible', function (assert) {
          assert.expect(3);

          let content = page.sidebar.contacts.listText;

          for (let contact of contacts) {
            assert.contains(content, contact.name);
          }
        });
      });

      module('2 letters are entered', function (hooks) {
        hooks.beforeEach(async function () {
          await page.sidebar.search('BB');
        });

        test('help text is shown', function (assert) {
          assert.contains(page.sidebar.searchInfo, t('ui.sidebar.results', { num: 2 }));
        });

        test('Matches are shown', function (assert) {
          let content = page.sidebar.contacts.listText;

          assert.notContains(content, 'AA');
          assert.contains(content, 'BB');
          assert.contains(content, 'BBC');
        });
      });

      module('offline contacts are hidden', function (hooks) {
        hooks.beforeEach(async function () {
          await setupOfflineContactsTest();
        });

        module('1 letter is entered', function (hooks) {
          hooks.beforeEach(async function () {
            await page.sidebar.search('B');
          });
        });

        module('2 letters are entered', function (hooks) {
          hooks.beforeEach(async function () {
            await page.sidebar.search('B');
          });
        });
      });
    });
  });

  module('Contacts', function () {
    module('the add contact button is clicked', function (hooks) {
      hooks.beforeEach(async function () {
        await page.sidebar.contacts.header.clickAdd();
      });

      test('a navigation occurred', function (assert) {
        assert.equal(currentURL(), '/add-friend');
      });
    });

    module('the actual list of contacts', function () {
      module('there are 0 contacts', function () {
        test('only the current user is shown', async function (assert) {
          const name = getService('current-user')!.name!;
          const content = page.sidebar.contacts.list.map((c: any) => c.text).join();

          assert.equal(content, name);
        });

        test('offline count does not show', function (assert) {
          assert.notOk(page.sidebar.contacts.offlineCount.isVisible);
        });
      });

      module('there is 1 contact', function (hooks) {
        hooks.beforeEach(async function () {
          await createContact('first contact');
        });

        test('there are 2 rows of names', function (assert) {
          assert.equal(page.sidebar.contacts.list.length, 2);
        });

        test('offline count does not show', function (assert) {
          assert.notOk(page.sidebar.contacts.offlineCount.isVisible, 'offline count is shown');
        });

        module('pinned contact are to be shown', function (hooks) {
          hooks.beforeEach(async function () {
            await page.sidebar.contacts.list[1].pin();
            await visit('/settings/interface');
            await settings.ui.toggleHideOfflineContacts();
          });

          test('both contacts should be shown', function (assert) {
            assert.equal(page.sidebar.contacts.list.length, 2, 'two users in the contacts list');
          });

          test('offline count does not show', function (assert) {
            assert.notOk(page.sidebar.contacts.offlineCount.isVisible, 'offline count is shown');
          });

          test('pinned contact should appear below current user', async function (assert) {
            const contacts = page.sidebar.contacts.list;

            assert.equal(contacts[0].name, 'Test User');
            assert.equal(contacts[1].name, 'first contact');
          });
        });

        module('offline contacts are to be hidden', function (hooks) {
          hooks.beforeEach(async function () {
            await setupOfflineContactsTest();
          });

          test('only the current user is shown', function (assert) {
            assert.expect(2);
            onlyCurrentUserIsShownTest(assert);
          });

          test('offline count is shown', function (assert) {
            const result = page.sidebar.contacts.offlineCount.text;

            assert.matches(result, /1/);
          });
        });
      });

      module('there are 2 contacts', function (hooks) {
        let firstContact!: Contact;
        let secondContact!: Contact;

        hooks.beforeEach(async function () {
          firstContact = await createContact('first contact');
          secondContact = await createContact('second contact');
        });

        test('there are 3 rows of names', function (assert) {
          assert.equal(page.sidebar.contacts.list.length, 3, 'there are 3 contacts');
        });

        module('pinned contacts are to be shown', function (hooks) {
          hooks.beforeEach(async function () {
            const contacts = page.sidebar.contacts.list;

            await contacts[1].pin();
            await contacts[2].pin();
            await visit('/settings/interface');
            await settings.ui.toggleHideOfflineContacts();
          });

          test('all contacts should be shown', function (assert) {
            assert.equal(page.sidebar.contacts.list.length, 3, 'three users in the contacts list');
          });

          test('two contacts should be shown and one hidden', async function (assert) {
            const contacts = page.sidebar.contacts;

            await contacts.list[1].pin();
            assert.equal(contacts.list.length, 2, 'two users in the contacts list');
            assert.matches(contacts.offlineCount.text, /1/);
          });

          test('offline count does not show', function (assert) {
            assert.notOk(page.sidebar.contacts.offlineCount.isVisible, 'offline count is shown');
          });

          test('pinned contacts should appear above offline contacts', async function (assert) {
            const contacts = page.sidebar.contacts.list;

            assert.equal(contacts[0].name, 'Test User');
            assert.equal(contacts[1].name, 'first contact');
            assert.equal(contacts[2].name, 'second contact');

            await contacts[1].pin();
            await visit('/settings/interface');
            await settings.ui.toggleHideOfflineContacts();

            assert.equal(contacts[0].name, 'Test User');
            assert.equal(contacts[1].name, 'second contact');
            assert.equal(contacts[2].name, 'first contact');
          });
        });

        module('offline contacts are to be hidden', function (hooks) {
          hooks.beforeEach(async function () {
            await setupOfflineContactsTest();
          });

          test('only the current user is shown', function (assert) {
            assert.expect(4);

            onlyCurrentUserIsShownTest(assert);

            const content = page.sidebar.contacts.listText;

            assert.notContains(content, firstContact.name);
            assert.notContains(content, secondContact.name);
          });

          test('offline count is shown', function (assert) {
            const result = page.sidebar.contacts.offlineCount.text;

            assert.matches(result, /2/);
          });

          module(`but one of them has sent us a message we haven't read`, function (hooks) {
            hooks.beforeEach(async function () {
              await createMessage(getCurrentUser()!, firstContact, 'test', {
                readAt: undefined,
              });
            });

            skip('the unread message causes the person to be shown', function (assert) {
              const content = page.sidebar.contacts.listText;

              assert.contains(content, firstContact.name);
            });
          });
        });
      });

      module('there are enough contacts to scroll', function (hooks) {
        hooks.before(async function () {
          // TODO: these need implementing
          // Need a way to set the window size
        });
      });
    });
  });

  module('Channels', function () {
    test('the channel form is not visible', function (assert) {
      const form = page.sidebar.channels.form.isVisible;

      assert.notOk(form);
    });

    test('there are 0 channels', async function (assert) {
      const store = getStore();
      const known = await store.findAll('channel');

      assert.equal(known.length, 0);
    });

    module('the add channel button is clicked', function (hooks) {
      hooks.beforeEach(async function () {
        await page.sidebar.channels.toggleForm();
      });

      skip('the channel form is now visible', function (assert) {
        const form = page.sidebar.channels.form.isVisible;

        assert.ok(form);
      });

      module('the cancel button is clicked', function (hooks) {
        hooks.beforeEach(async function () {
          await page.sidebar.channels.toggleForm();
          await settled();
        });

        skip('the channel form is not visible', function (assert) {
          const form = page.sidebar.channels.form.isVisible;

          assert.notOk(form);
        });
      });

      module('the channel form is submitted', function (hooks) {
        hooks.beforeEach(async function () {
          await page.sidebar.channels.form.fill('Vertical Flat Plates');
          await page.sidebar.channels.form.submit();
          await settled();
        });

        skip('the form becomes hidden', async function (assert) {
          // TODO: figure out why settled state doesn't capture this behavior
          await waitUntil(() => !page.sidebar.channels.form.isVisible);
          const form = page.sidebar.channels.form.isVisible;

          assert.notOk(form);
        });

        skip('a channel is created', function (assert) {
          const store = getService('store');
          const known = store.peekAll('channel');

          assert.equal(known.length, 1);
          assert.equal(known.firstObject?.name, 'Vertical Flat Plates');
        });
      });
    });
  });
});

async function setupOfflineContactsTest() {
  await visit('/settings/interface');
  await settings.ui.toggleHideOfflineContacts();
  await waitFor(selectors.offlineCount);
}

function onlyCurrentUserIsShownTest(assert: Assert) {
  const name = getService('current-user')!.name!;
  const content = page.sidebar.contacts.listText;

  assert.contains(content, name);
  assert.equal(page.sidebar.contacts.list.length, 1, 'one user in the contacts list');
}
