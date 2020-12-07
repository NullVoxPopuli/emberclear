import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

import { TABLET_WIDTH } from 'emberclear/utils/breakpoints';

type SidebarService = import('emberclear/services/sidebar').default;

type Args = [() => void];

export default class HandleSidebarClick extends Helper {
  @service declare sidebar: SidebarService;

  compute([handler]: Args) {
    return (e?: Event) => {
      e?.preventDefault?.();

      if (window.innerWidth < TABLET_WIDTH) {
        // non-blocking
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.sidebar.hide();
      }

      handler();
    };
  }
}
