'use strict';

const { setUpWebDriver } = require('@faltest/lifecycle');
const assert = require('assert');
const Login = require('../page-objects/login');
const AddFriend = require('../page-objects/add-friend');
const Chat = require('../page-objects/chat');
const { startServer } = require('../helpers/start-server');

describe('smoke', function () {
  before(async function () {
    switch (process.env.WEBDRIVER_TARGET) {
      case 'pull-request': {
        console.info('---- DEPLOY PREVIEW ----');
        console.info(process.env.DEPLOY_URL);

        this.host = process.env.DEPLOY_URL;

        if (!this.host) {
          throw new Error(`host not set. Did you forget to set $DEPLOY_URL?`);
        }

        break;
      }
      case 'local': {
        let { server, port } = await startServer();

        this.server = server;

        this.host = `http://localhost:${port}`;

        break;
      }
      case 'ember': {
        this.host = `https://localhost:4201`;

        break;
      }
      default: {
        this.host = 'https://emberclear.io';

        break;
      }
    }
  });

  setUpWebDriver.call(this);

  beforeEach(async function () {
    this.loginPage1 = new Login(this.browsers[0]);
    this.loginPage2 = new Login(this.browsers[1]);
    this.addFriendPage1 = new AddFriend(this.host, this.browsers[0]);
    this.addFriendPage2 = new AddFriend(this.host, this.browsers[1]);
    this.chatPage1 = new Chat(this.browsers[0]);
    this.chatPage2 = new Chat(this.browsers[1]);

    await Promise.all([
      this.browsers[0].url(this.host),
      this.browsers[1].url(this.host),
    ]);
  });

  after(async function () {
    if (this.server) {
      this.server.kill();

      await this.server;
    }
  });

  it('works', async function () {
    let users = [
      {
        name: 'jRA0gfR7',
        mnemonic:
          'assist lounge buyer clump marble vital check ordinary liar resemble fantasy vapor snow stool myth mention mention ask tiger video ball suspect lens above loan',
        message: 'Hello Browser 2!',
        publicKey:
          'b4645cdeec6889d7515aeadab66b2b4fd0fbac5751f701e0289a1add7822a739',
      },
      {
        name: 'SpxDqBPG',
        mnemonic:
          'glimpse moment duck pigeon awake gossip burger repair dizzy employ diary merge swarm select very liar rail exhibit space runway face inhale absorb able trigger',
        message: 'Hello Browser 1!',
        publicKey:
          'e3ab4b615a00cacbd44d498cdc4d880bb484e2e6e0b1b02bbf3d393c12183047',
      },
    ];

    await Promise.all([
      this.loginPage1.logIn(users[0]),
      this.loginPage2.logIn(users[1]),
    ]);

    await Promise.all([
      this.addFriendPage1.addFriend(users[1]),
      this.addFriendPage2.addFriend(users[0]),
    ]);

    await Promise.all([
      this.chatPage1.sendMessage(users[0].message),
      this.chatPage2.sendMessage(users[1].message),
    ]);

    await Promise.all([
      this.chatPage1.waitForResponse(users[1]),
      this.chatPage2.waitForResponse(users[0]),
    ]);

    assert.ok(true);
  });
});
