import { helper as buildHelper } from '@ember/component/helper';
import User from 'emberclear/models/user';

export function isContact([record] /*, hash*/) {
  return record instanceof User;
}

export default buildHelper(isContact);
