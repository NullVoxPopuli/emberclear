import Component from 'sparkles-component';
import { reads } from '@ember-decorators/object/computed';
import { service } from '@ember-decorators/service';

import Notifications from 'emberclear/services/notifications/service';

export default class NotificationPrompt extends Component {
  @service notifications!: Notifications;

  @reads('notifications.showInAppPrompt') isVisible!: boolean;

  enableNotifications() {
    this.notifications.askPermission();
  }

  neverAskAgain() {
    this.notifications.set('isNeverGoingToAskAgain', true);
  }

  askNextTime() {
    this.notifications.set('isHiddenUntilBrowserRefresh', true);
  }
}
