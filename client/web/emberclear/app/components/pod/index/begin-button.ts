import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import { inject as service } from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';

import type { CurrentUserService } from '@emberclear/local-account';

class BeginButton extends Component {
  @service declare currentUser: CurrentUserService;
}

export default setComponentTemplate(
  hbs`
  <LinkTo @route='chat' class='button'>
    {{#if this.currentUser.isLoggedIn}}
      {{t 'routes.chat'}}
    {{else}}
      {{t 'buttons.begin'}}
    {{/if}}
  </LinkTo>
`,
  BeginButton
);
