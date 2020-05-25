import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import { Status } from 'emberclear/models/contact';

module('Integration | Component | status-icon', function (hooks) {
  setupRenderingTest(hooks);

  test('online', async function (assert) {
    this.setProperties({
      contact: { onlineStatus: Status.ONLINE },
    });
    await render(hbs`<StatusIcon @contact={{this.contact}}/>`);

    assert.dom('svg').hasClass('text-success');
  });

  test('offline', async function (assert) {
    this.setProperties({
      contact: { onlineStatus: Status.OFFLINE },
    });
    await render(hbs`<StatusIcon @contact={{this.contact}}/>`);

    assert.dom('svg').hasClass('text-lighter');
  });

  test('away', async function (assert) {
    this.setProperties({
      contact: { onlineStatus: Status.AWAY },
    });
    await render(hbs`<StatusIcon @contact={{this.contact}}/>`);

    assert.dom('svg').hasClass('text-warning');
  });

  test('busy', async function (assert) {
    this.setProperties({
      contact: { onlineStatus: Status.BUSY },
    });
    await render(hbs`<StatusIcon @contact={{this.contact}}/>`);

    assert.dom('svg').hasClass('text-lighter');
  });

  test('other', async function (assert) {
    this.setProperties({
      contact: { onlineStatus: 'invalid-tanohusoatuhoeasut' },
    });
    await render(hbs`<StatusIcon @contact={{this.contact}}/>`);

    assert.dom('svg').hasClass('text-darker');
  });
});
