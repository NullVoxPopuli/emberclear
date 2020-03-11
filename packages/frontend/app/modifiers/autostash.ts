import Modifier from 'ember-modifier';

interface Args {
  positional: [];
  named: {
    data: string;
    when: string;
    restore: (data: string) => void;
  };
}

const LS_KEY = '__AutoStash__';

export default class Autostash extends Modifier<Args> {
  lastWhen?: string;

  didInstall() {
    this.lastWhen = this.args.named.when;
  }

  didReceiveArguments() {
    if (!this.lastWhen) return;

    let { data, when, restore } = this.args.named;

    if (when === this.lastWhen) {
      return set(when, data);
    }

    let stored = lookup(when);

    if (stored) {
      restore(stored);
    }

    this.lastWhen = this.args.named.when;
  }
}

function set(key: string, value: string) {
  let lsKey = `${LS_KEY}${key}`;

  window.localStorage.setItem(lsKey, value);
}


function lookup(key: string) {
  let lsKey = `${LS_KEY}${key}`;

  return window.localStorage.getItem(lsKey);
}
