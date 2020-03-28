import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import CurrentUserService from 'emberclear/services/current-user';

export default class SetupCompleted extends Component {
  @service currentUser!: CurrentUserService;

}
