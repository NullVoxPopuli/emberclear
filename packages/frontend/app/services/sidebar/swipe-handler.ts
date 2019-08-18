import Hammer from 'hammerjs';

interface Args {
  content: HTMLElement;
  sidebarWidth: number;
  flickRegion: number;
}

/**
 * NOTE: does not support dynamic width sidebar
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

  private openThreshold: number;
  private closeThreshold: number;

  private isDragging = false;
  private initialX = 0;
  private currentX = 0;
  private isOpening = false;
  private isClosing = false;

  /**
   * @param HTMLElement mainContent - the content to move.
   *                    not the sidebar.
   */
  constructor({ content, sidebarWidth, flickRegion }: Args) {
    this.content = content;
    this.sidebarWidth = sidebarWidth;
    this.flickRegion = flickRegion;

    this.openThreshold = sidebarWidth * flickRegion;
    this.closeThreshold = sidebarWidth * (1 - flickRegion);
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
  }

  handleDrag(e: HammerStatic['Input']) {
    // left is closing -- 300px -> 0px
    // right is opening -- 0px -> 300px
    if (!this.isDragging) {
      this.isDragging = true;
      this.initialX = this.content.getBoundingClientRect().left;
    }

    this.currentX = this.content.getBoundingClientRect().left;

    // direction is none on a final event / panend
    if (e.direction !== Hammer.DIRECTION_NONE) {
      this.isOpening = e.direction === Hammer.DIRECTION_RIGHT;
      this.isClosing = e.direction === Hammer.DIRECTION_LEFT;
    }

    let deltaX = 0;
    let deltaXFromStart = e.deltaX;
    let nextX = deltaXFromStart + this.initialX;
    let shouldClose = nextX < this.closeThreshold;
    let shouldOpen = nextX > this.openThreshold;
    let isFullyOpen = nextX >= this.sidebarWidth;
    let isFullyClosed = nextX <= 0;

    if (isFullyOpen) {
      nextX = this.sidebarWidth;
      if (this.isOpening) {
        deltaX = 0;
      } else {
        deltaX = nextX - this.currentX;
      }
    } else if (isFullyClosed) {
      nextX = 0;
      if (this.isClosing) {
        deltaX = 0;
      } else {
        deltaX = nextX - this.currentX;
      }
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
      } else {
        // if (isOpening) {
        if (shouldOpen) {
          nextX = this.sidebarWidth;
        } else {
          nextX = 0;
        }
      }

      deltaX = nextX - this.currentX;
    }

    this.content.style.setProperty('--dx', `${deltaX}px`);
    this.content.style.transform = `translateX(${nextX}px)`;
  }
}
