'use strict';

const { setUpWebDriver } = require('@faltest/lifecycle');
const execa = require('execa');
const assert = require('assert');
const path = require('path');

const distLocation = path.join('..', 'frontend', 'dist');

describe('smoke', function() {
  setUpWebDriver.call(this);

  before(async function() {
    this.server = execa('http-server', [distLocation], {
      preferLocal: true,
    });

    this.port = await new Promise(resolve => {
      this.server.stdout.on('data', data => {
        let str = data.toString();
        let matches = str.match(/http:\/\/127\.0\.0\.1:(\d+)$/m);
        if (matches) {
          let port = parseInt(matches[1]);

          resolve(port);
        }
      });
    });

    this.run = async function run({
      myName,
      myMnemonic,
      myMessage,
      theirPublicKey,
      theirName,
      theirMessage,
    }) {
      let [name, mnemonic] = await this.browser.$$('input');

      await name.setValue(myName);
      await mnemonic.setValue(myMnemonic);

      let buttons = await this.browser.$$('button');

      await buttons[buttons.length - 1].click();

      // element click intercepted: Element <a class="button button-xs" href="/add-friend">...</a> is not clickable at point (274, 76). Other element would receive the click: <a class="service-worker-update-notify alert alert-info has-shadow" href="/chat" style="z-index: 100;">...</a>
      // await this.browser.click('[href="/add-friend"]');
      await this.browser.execute(() => {
        // eslint-disable-next-line no-undef
        document.querySelector('[href="/add-friend"]').click();
      });

      await this.browser.url(
        `http://localhost:${this.port}/invite?name=${theirName}&publicKey=${theirPublicKey}`
      );

      await this.browser.setValue('textarea', myMessage);

      await new Promise(resolve => setTimeout(resolve, 30 * 1000));

      await this.browser.click('[value="Send"]');

      await this.browser.waitUntil(async () => {
        let messages = await this.browser.$$('.message');

        for (let message of messages) {
          let name = await this.browser.getText(message.$('.message-header .from'));
          let text = await this.browser.getText(message.$('.message-body'));

          if (name === theirName && text === theirMessage) {
            return true;
          }
        }
      }, parseInt(process.env.WEBDRIVER_TIMEOUTS_OVERRIDE));
    };
  });

  beforeEach(async function() {
    await this.browser.url(`http://localhost:${this.port}`);

    await this.browser.click('[href="/chat"]');

    await this.browser.click('[href="/login"]');
  });

  after(async function() {
    await this.server.kill();

    await this.server;
  });

  it('works #browser1', async function() {
    await this.run({
      myName: 'jRA0gfR7',
      myMnemonic:
        'assist lounge buyer clump marble vital check ordinary liar resemble fantasy vapor snow stool myth mention mention ask tiger video ball suspect lens above loan',
      myMessage: 'Hello Browser 2!',
      theirPublicKey: 'e3ab4b615a00cacbd44d498cdc4d880bb484e2e6e0b1b02bbf3d393c12183047',
      theirName: 'SpxDqBPG',
      theirMessage: 'Hello Browser 1!',
    });

    assert.ok(true);
  });

  it('works #browser2', async function() {
    await this.run({
      myName: 'SpxDqBPG',
      myMnemonic:
        'glimpse moment duck pigeon awake gossip burger repair dizzy employ diary merge swarm select very liar rail exhibit space runway face inhale absorb able trigger',
      myMessage: 'Hello Browser 1!',
      theirPublicKey: 'b4645cdeec6889d7515aeadab66b2b4fd0fbac5751f701e0289a1add7822a739',
      theirName: 'jRA0gfR7',
      theirMessage: 'Hello Browser 2!',
    });

    assert.ok(true);
  });
});
