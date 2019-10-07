'use strict';

const { setUpWebDriver } = require('@faltest/lifecycle');
const execa = require('execa');
const assert = require('assert');
const path = require('path');

const distLocation = path.join('..', 'frontend', 'dist');

describe('smoke', function() {
  setUpWebDriver.call(this, {
    overrides: {
      browsers: 2
    }
  });

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

    this.logIn = async function logIn(browser, user) {
      await browser.url(`http://localhost:${this.port}`);

      await browser.click('[href="/chat"]');

      await browser.click('[href="/login"]');

      let [name, mnemonic] = await browser.$$('input');

      await name.setValue(user.name);
      await mnemonic.setValue(user.mnemonic);

      let buttons = await browser.$$('button');

      await buttons[buttons.length - 1].click();
    };

    this.addFriend = async function addFriend(browser, user) {
      // element click intercepted: Element <a class="button button-xs" href="/add-friend">...</a> is not clickable at point (274, 76). Other element would receive the click: <a class="service-worker-update-notify alert alert-info has-shadow" href="/chat" style="z-index: 100;">...</a>
      // await browser.click('[href="/add-friend"]');
      await browser.execute(() => {
        // eslint-disable-next-line no-undef
        document.querySelector('[href="/add-friend"]').click();
      });

      await browser.url(
        `http://localhost:${this.port}/invite?name=${user.name}&publicKey=${user.publicKey}`
      );
    };

    this.sendMessage = async function sendMessage(browser, message) {
      await browser.setValue('textarea', message);

      // This is only necessary for CI, but not sure why.
      await new Promise(resolve => setTimeout(resolve, 30 * 1000));

      await browser.click('[value="Send"]');
    };

    this.waitForResponse = async function waitForResponse(browser, user) {
      await browser.waitUntil(async () => {
        let messages = await browser.$$('.message');

        for (let message of messages) {
          let name = await browser.getText(message.$('.message-header .from'));
          let text = await browser.getText(message.$('.message-body'));

          if (name === user.name && text === user.message) {
            return true;
          }
        }
      }, parseInt(process.env.WEBDRIVER_TIMEOUTS_OVERRIDE));
    };
  });

  after(async function() {
    await this.server.kill();

    await this.server;
  });

  it('works', async function() {
    let users = [
      {
        name: 'jRA0gfR7',
        mnemonic: 'assist lounge buyer clump marble vital check ordinary liar resemble fantasy vapor snow stool myth mention mention ask tiger video ball suspect lens above loan',
        message: 'Hello Browser 2!',
        publicKey: 'b4645cdeec6889d7515aeadab66b2b4fd0fbac5751f701e0289a1add7822a739',
      },
      {
        name: 'SpxDqBPG',
        mnemonic: 'glimpse moment duck pigeon awake gossip burger repair dizzy employ diary merge swarm select very liar rail exhibit space runway face inhale absorb able trigger',
        message: 'Hello Browser 1!',
        publicKey: 'e3ab4b615a00cacbd44d498cdc4d880bb484e2e6e0b1b02bbf3d393c12183047',
      },
    ];

    await Promise.all([
      this.logIn(this.browsers[0], users[0]),
      this.logIn(this.browsers[1], users[1]),
    ]);

    await Promise.all([
      this.addFriend(this.browsers[0], users[1]),
      this.addFriend(this.browsers[1], users[0]),
    ]);

    await Promise.all([
      this.sendMessage(this.browsers[0], users[0].message),
      this.sendMessage(this.browsers[1], users[1].message),
    ]);

    await Promise.all([
      this.waitForResponse(this.browsers[0], users[1]),
      this.waitForResponse(this.browsers[1], users[0]),
    ]);

    assert.ok(true);
  });
});
