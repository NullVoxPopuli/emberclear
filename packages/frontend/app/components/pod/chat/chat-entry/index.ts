import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { waitForPromise } from '@ember/test-waiters';

import { action, set } from '@ember/object';

import { inject as service } from '@ember/service';

import StoreService from '@ember-data/store';
import MessageDispatcher from 'emberclear/services/messages/dispatcher';
import MessageFactory from 'emberclear/services/messages/factory';
import Channel from 'emberclear/models/channel';
import Contact from 'emberclear/models/contact';
import { unicode } from 'emojis';

const EMOJI_REGEX = /:[^:]+:/g;

interface IArgs {
  to: Contact | Channel;
}

export default class ChatEntry extends Component<IArgs> {
  @service('messages/dispatcher') messageDispatcher!: MessageDispatcher;
  @service('messages/factory') messageFactory!: MessageFactory;
  @service store!: StoreService;

  @tracked isDisabled = false;
  @tracked isSubmitDisabled = true;

  text?: string;

  get placeholder() {
    const { to } = this.args;
    let prefix = '';

    if (to instanceof Channel) {
      prefix = 'everyone in ';
    }

    return `Send a message to ${prefix}${to.name}`;
  }

  @action
  async sendMessage() {
    if (!this.text) return;

    this.isDisabled = true;

    if (this.text.charAt(0) == '?') {
      this.processCommand(this.text);
    } else {
      await this.dispatchMessage(this.text);
    }

    this.isDisabled = false;
    this.updateText('');
  }

  @action
  updateText(text: string) {
    set(this, 'text', text);

    this.isSubmitDisabled = this.isDisabled || !text || text.length === 0;
  }

  @action
  onInput(event: KeyboardEvent) {
    const value = (event.target as any).value;

    // TODO: only test the regex since the last detected `:`
    // (for perf)
    if (EMOJI_REGEX.test(value)) {
      this.updateText(unicode(value));
    } else {
      this.updateText(value);
    }
  }

  @action
  onKeyPress(event: KeyboardEvent) {
    const { keyCode, shiftKey } = event;

    // don't submit when shift is being held.
    if (!shiftKey && keyCode === 13) {
      // non-blocking
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.sendMessage();

      // prevent regular 'Enter' from inserting a linebreak
      return false;
    }

    return true;
  }

  processCommand(text: String) {
    if(message.author.bot) return;
    if(message.content.indexOf(config.prefix) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase()
    const channel = message.channel.name
    const author = message.author

    if (command === "test" || command === "t") {
      // TODO
    }

    else if (command === "state" || command === "s") {
        // TODO 
    } 

	else if (command === "create-channel" || command === "c") {
	}

	else if (command === "add-member" || command === "a") {
			}

	else if (command === "remove-member" || command === "r") {
	}

	else if (command === "change-admin" || command === "p") {
	}

	else if (command === "vote" || command === "v") {
		}

	else if (command === "change-user-context-admin"  || command === "ucp") {
	}

	else if (command === "change-user-context-add-member" || command === "uca") {
	}

	else if (command === "change-user-context-remove-member" || command === "ucr") {
	}

	else if (command === "view-user-context" || command === "ucv") {
	}
	
	else if (command === "cancel-vote" || command === "cv") {
	}

	else if (command === "reset" || command === "rs") {
	}

	else if (command === "sync-discord-roles" || command === "d") {
		}
	
	else {
    // TODO help message
  }
  }

  async dispatchMessage(text: string) {
    await waitForPromise(this.messageDispatcher.send(text, this.args.to));
  }
}
