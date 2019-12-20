import Component from '@glimmer/component';

import uuid from 'uuid';

export default class Field extends Component {
  id = uuid();
}
