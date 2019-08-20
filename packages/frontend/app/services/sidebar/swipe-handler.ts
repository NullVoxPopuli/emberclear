import Hammer from 'hammerjs';

interface Args {
  content: HTMLElement;
  sidebarWidth: number;
  flickRegion: number;
  pushUntilWidth: number;
}

/**
 * NOTE: does not support dynamic width sidebar
 * NOTE: this only works for a sidebar on the left
 */
export class SwipeHandler {
  /**
   * The content to be moved. Not the sidebar
   */
  content: HTMLElement;

  /**
   * Width of the sidebar. This determines how much movement to allow.
   */
  sidebarWidth: number;

  /**
   * The percent of the sidebar width to allow flicking fully open / closed.
   */
  flickRegion: number;

  /**
   * The px width of the window where the animation will "push" the content
   * out of the way, until this breakpoint, and then the content will be
   * resized.
   */
  pushUntilWidth: number;

  private openThreshold: number;
  private closeThreshold: number;

  private isDragging = false;
  private initialX = 0;
  private isOpening = false;
  private isClosing = false;

  constructor({ content, sidebarWidth, flickRegion, pushUntilWidth }: Args) {
    this.content = content;
    this.sidebarWidth = sidebarWidth;
    this.flickRegion = flickRegion;

    this.openThreshold = sidebarWidth * flickRegion;
    this.closeThreshold = sidebarWidth * (1 - flickRegion);

    this.pushUntilWidth = pushUntilWidth;
  }

  start() {
    let hammertime = new Hammer(document.body);

    hammertime.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL });
    hammertime.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
    hammertime.on('panleft panright panend', e => {
      switch (e.type) {
        case 'panleft':
          return this.handleDrag(e);
        case 'panright':
          return this.handleDrag(e);
        case 'panend':
          return this.handleDrag(e);
        default:
          console.info('gesture not handled', e);
      }
    });

    let boundResize = this.resizeHandler.bind(this);
    window.addEventListener('resize', boundResize);
  }

  handleDrag(e: HammerStatic['Input']) {
    if (!this.isDragging) {
      this.isDragging = true;
      this.initialX = this.content.getBoundingClientRect().left;
    }

    // direction is none on a final event / panend
    if (e.direction !== Hammer.DIRECTION_NONE) {
      this.isOpening = e.direction === Hammer.DIRECTION_RIGHT;
      this.isClosing = e.direction === Hammer.DIRECTION_LEFT;
    }

    if (this.isOpening) {
      this.content.style.transition = `width 0.11s linear, transform 0.1s linear`;
    } else {
      this.content.style.transition = `width 0.0s linear, transform 0.1s linear`;
    }

    let deltaXFromStart = e.deltaX;
    let nextX = deltaXFromStart + this.initialX;
    let shouldClose = nextX < this.closeThreshold;
    let shouldOpen = nextX > this.openThreshold;
    let isFullyOpen = nextX >= this.sidebarWidth;
    let isFullyClosed = nextX <= 0;

    if (isFullyOpen) {
      nextX = this.sidebarWidth;
    } else if (isFullyClosed) {
      nextX = 0;
    }

    if (e.isFinal) {
      this.isDragging = false;

      // is far enough?
      if (this.isClosing) {
        if (shouldClose) {
          nextX = 0;
        } else {
          nextX = this.sidebarWidth;
        }
      } else if (this.isOpening) {
        if (shouldOpen) {
          nextX = this.sidebarWidth;
        } else {
          nextX = 0;
        }
      }
    }

    this.content.style.setProperty('--dx', `${nextX}`);

    this.resizeHandler();

    this.content.style.transform = `translateX(${nextX}px)`;
  }

  resizeHandler() {
    if (window.innerWidth >= this.pushUntilWidth) {
      let nextX = this.content.style.getPropertyValue('--dx');
      this.content.style.setProperty('width', `${window.innerWidth - nextX}px`);
    } else {
      this.content.style.setProperty('width', null);
    }
  }
}
