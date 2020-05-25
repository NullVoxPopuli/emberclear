import { helper as buildHelper } from '@ember/component/helper';
import Channel from 'emberclear/models/channel';

export function isChannel([record] /*, hash*/) {
  return record instanceof Channel;
}

export default buildHelper(isChannel);
