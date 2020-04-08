import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

import { TABLET_WIDTH } from 'emberclear/utils/breakpoints';

type SidebarService = import('emberclear/services/sidebar').default;

type Args = [() => void];

export default class HandleSidebarClick extends Helper {
  @service sidebar!: SidebarService;

  compute([handler]: Args) {
    return (e?: Event) => {
      e?.preventDefault?.();

      if (window.innerWidth < TABLET_WIDTH) {
        this.sidebar.hide();
      }

      handler();
    };
  }
}
