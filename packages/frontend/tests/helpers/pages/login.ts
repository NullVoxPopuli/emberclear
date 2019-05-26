import { click, fillIn } from '@ember/test-helpers';

const wrapper = '[data-test-focus-card]';

export const loginForm = {
  typeName: (name: string) => fillIn(`${wrapper} [data-test-name]`, name),
  typeMnemonic: (mnemonic: string) => fillIn(`${wrapper} [data-test-mnemonic]`, mnemonic),

  submit: () => click(`${wrapper} [data-test-submit-login]`),
};
