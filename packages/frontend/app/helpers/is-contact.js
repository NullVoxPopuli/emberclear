import { helper as buildHelper } from '@ember/component/helper';
import Contact from 'emberclear/src/data/models/contact/model';

export function isContact([record] /*, hash*/) {
  return record instanceof Contact;
}

export const helper = buildHelper(isContact);
