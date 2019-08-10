import Component from '@glimmer/component';
import { action } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

import Notifications from 'emberclear/services/notifications/service';

export default class NotificationPrompt extends Component {
  @service notifications!: Notifications;

  @reads('notifications.showInAppPrompt') isVisible!: boolean;

  @action enableNotifications() {
    this.notifications.askPermission();
  }

  @action neverAskAgain() {
    this.notifications.isNeverGoingToAskAgain = true;
  }

  @action askNextTime() {
    this.notifications.isHiddenUntilBrowserRefresh = true;
  }
}
