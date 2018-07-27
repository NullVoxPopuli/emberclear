import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { reads } from '@ember-decorators/object/computed';
import { service } from '@ember-decorators/service';

import Notifications from 'emberclear/services/notifications/service';

export default class NotificationPrompt extends Component {
  @service notifications!: Notifications;

  @reads('notifications.showInAppPrompt')
  isVisible!: boolean;

  @action
  enableNotifications() {
    this.notifications.askPermission();
  }

  @action
  neverAskAgain() {
    this.set('notifications.isNeverGoingToAskAgain', true);
  }

  @action
  askNextTime() {
    this.set('notifications.isHiddenUntilBrowserRefresh', true);
  }
}
