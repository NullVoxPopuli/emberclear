export function setupWindowNotification(hooks: NestedHooks) {
  let originalNotification;
  hooks.beforeEach(function() {
    originalNotification = window.Notification;
  });
  hooks.afterEach(function() {
    window.Notification = originalNotification;
  });
}
