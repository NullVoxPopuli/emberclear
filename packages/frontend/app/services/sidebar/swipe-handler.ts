import Hammer from 'hammerjs';

interface Args {
  container?: HTMLElement;
  content: HTMLElement;
  sidebarWidth: number;
  flickRegion: number;
  pushUntilWidth: number;
}

interface ContentKeyFrame {
  transform: string;
  width?: string;
}

const easing = 'cubic-bezier(0.215, 0.610, 0.355, 1.000)';

/**
 * NOTE: does not support dynamic width sidebar
 * NOTE: this only works for a sidebar on the left
 */
export class SwipeHandler {
  /**
   * The containing content, defaults to the body.
   */
  container: HTMLElement;
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

  constructor({ container, content, sidebarWidth, flickRegion, pushUntilWidth }: Args) {
    this.container = container || document.body;
    this.content = content;
    this.sidebarWidth = sidebarWidth;
    this.flickRegion = flickRegion;

    this.openThreshold = sidebarWidth * flickRegion;
    this.closeThreshold = sidebarWidth * (1 - flickRegion);

    this.pushUntilWidth = pushUntilWidth;
  }

  get isPushing() {
    return this.container.clientWidth < this.pushUntilWidth;
  }

  get currentLeft() {
    return this.content.getBoundingClientRect().left;
  }

  async open() {
    return this.finish(this.sidebarWidth);
  }

  async close() {
    return this.finish(0);
  }

  start() {
    let hammertime = new Hammer(this.container);

    hammertime.get('pan').set({
      direction: Hammer.DIRECTION_HORIZONTAL,
      threshold: 15,
    });

    hammertime.on('panstart panleft panright panend', e => {
      switch (e.type) {
        case 'panstart':
        case 'panleft':
        case 'panright':
        case 'panend':
          return this.handleDrag(e);
        default:
          console.info('gesture not handled', e);
      }
    });

    let boundResize = this.resizeHandler.bind(this);
    window.addEventListener('resize', boundResize);
  }

  private handleDrag(e: HammerStatic['Input']) {
    if (!this.isDragging) {
      if (e.isFinal) {
        return;
      }

      this.isDragging = true;
      this.initialX = this.currentLeft;
    }

    // direction is none on a final event / panend
    // so, we need to make sure we have the last known
    // isOpening / isClosing set from the last gestrue event.
    if (e.direction !== Hammer.DIRECTION_NONE) {
      this.isOpening = e.direction === Hammer.DIRECTION_RIGHT;
      this.isClosing = e.direction === Hammer.DIRECTION_LEFT;
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

      this.content.style.setProperty('--dx', `${nextX}`);

      this.isOpening = false;
      this.isClosing = false;
      this.isDragging = false;
      this.initialX = nextX;

      return this.finish(nextX);
    }

    this.setPosition(nextX);
  }

  private finish(nextX: number) {
    let prevX = this.currentLeft;

    let keyFrames: ContentKeyFrame[] = [
      { transform: `translateX(${prevX}px)` },
      { transform: `translateX(${nextX}px)` },
    ];

    if (!this.isPushing) {
      keyFrames[0].width = `${this.container.clientWidth - prevX}px`;
      keyFrames[1].width = `${this.container.clientWidth - nextX}px`;
    }

    let animation = this.content.animate(keyFrames as any /* :( */, { duration: 200, easing });

    return new Promise(resolve => {
      let finisher = () => {
        this.setPosition(nextX);
        resolve();
      };

      animation.onfinish = finisher;
    });
  }

  private setPosition(nextX: number) {
    this.content.style.setProperty('--dx', `${nextX}`);
    this.content.style.transform = `translateX(${nextX}px)`;

    this.resizeHandler();
  }

  private resizeHandler() {
    if (!this.isPushing) {
      let nextX = parseInt(this.content.style.getPropertyValue('--dx'), 10);

      this.content.style.setProperty('width', `${this.container.clientWidth - nextX}px`);
    } else {
      this.content.style.setProperty('width', null);
    }
  }
}
