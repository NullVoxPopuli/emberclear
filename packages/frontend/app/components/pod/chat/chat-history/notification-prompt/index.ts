import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import Notifications from 'emberclear/services/notifications';

export default class NotificationPrompt extends Component {
  @service notifications!: Notifications;

  get isVisible() {
    return this.notifications.showInAppPrompt;
  }

  @action
  enableNotifications() {
    this.notifications.askPermission();
  }

  @action
  neverAskAgain() {
    this.notifications.isNeverGoingToAskAgain = true;
  }

  @action
  askNextTime() {
    this.notifications.isHiddenUntilBrowserRefresh = true;
  }
}
