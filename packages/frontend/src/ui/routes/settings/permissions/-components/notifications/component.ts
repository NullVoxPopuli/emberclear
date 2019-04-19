import Component from 'sparkles-component';
import { tracked } from '@glimmer/tracking';

import { inject as service } from '@ember/service';

import NotificationsService from 'emberclear/services/notifications/service';

// TODO: extract per-permission components
export default class Permissions extends Component {
  @service notifications!: NotificationsService;

  @tracked isEnabled = false;

  didInsertElement() {
    this.isEnabled = this.notifications.isPermissionGranted;
  }

  async askNotifications() {
    // todo: need observer or something to know when to update UI?
    // TODO: on init, set a property, don't observe

    try {
      await this.notifications.askPermission();
      this.isEnabled = true;
    } catch (e) {
      this.isEnabled = false;
    }
  }

  async disable() {
    await navigator.permissions.revoke({ name: 'notifications' });
    this.isEnabled = false;
  }
}
