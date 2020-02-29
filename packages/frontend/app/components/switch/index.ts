import Component from '@glimmer/component';

import { v4 as uuid } from 'uuid';

export default class Field extends Component {
  id = uuid();
}
