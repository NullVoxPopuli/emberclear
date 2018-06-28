import { click, fillIn } from '@ember/test-helpers';

const form = '[data-test-name-form]';

export const nameForm = {
  clickNext: () => click(`${form} [data-test-next]`),
  enterName: (text: string) => fillIn(`${form} [data-test-name-field]`, text)
}

export default {
  nameForm
}
