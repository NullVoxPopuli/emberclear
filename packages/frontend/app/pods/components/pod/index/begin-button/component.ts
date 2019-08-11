import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import hbs from 'ember-cli-htmlbars-inline-precompile';

import CurrentUserService from 'emberclear/services/current-user';

class BeginButton extends Component {
  @service currentUser!: CurrentUserService;

  @reads('currentUser.isLoggedIn') isLoggedIn!: boolean;
}

export default Ember._setComponentTemplate(
  hbs`
<Shadowed>
  {{#link-to 'chat' class='button'}}
    {{#if this.isLoggedIn}}
      {{t 'routes.chat'}}
    {{else}}
      {{t 'buttons.begin'}}
    {{/if}}
  {{/link-to}}
</Shadowed>
`,
  BeginButton
);
