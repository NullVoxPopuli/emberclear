import { helper as buildHelper } from '@ember/component/helper';
import Contact from 'emberclear/models/contact';

export function isContact([record] /*, hash*/) {
  return record instanceof Contact;
}

export default buildHelper(isContact);
