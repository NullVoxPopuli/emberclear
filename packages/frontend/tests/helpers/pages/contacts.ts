import {
  find, click, findAll
} from '@ember/test-helpers';

export const contacts = {
  rows: {
    dom: () => findAll('[data-test-contacts] [data-test-contact-row]'),
    removeAt: (index: number) => {
      const row = findAll('[data-test-contacts] [data-test-contact-row]')[index];
      const link = row.querySelector('a')!;

      return click(link);
    },
  },
  table: () => find('[data-test-contacts]'),
};
