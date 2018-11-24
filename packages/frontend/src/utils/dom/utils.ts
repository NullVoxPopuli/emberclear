import showdown from 'showdown';
import DOMPurify from 'dom-purify';

export function isElementWithin(element: HTMLElement, container: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  const isVisible = (
    rect.top >= containerRect.top &&
    rect.left >= containerRect.left &&
    rect.bottom <= containerRect.bottom &&
    rect.right <= containerRect.right
  );

  return isVisible;
}

export function isInElementWithinViewport(element: Element, container: Element): boolean {
  const containerRect = container.getBoundingClientRect();
  const childRect = element.getBoundingClientRect();

  const containerViewableArea = {
    height: container.clientHeight,
    width: container.clientWidth
  };

  const isViewable = (
    childRect.top >= containerRect.top
    && childRect.top <= containerRect.top + containerViewableArea.height
  );

  return isViewable;
}

export function keepInViewPort(element: HTMLElement, margin = 20 /* px */) {
  const rect = element.getBoundingClientRect();

  if (rect.left < 0) {
    element.style.left = `${margin}px`;
  }

  if (rect.right > window.innerWidth) {
    const delta = window.innerWidth - rect.right;

    element.style.left = `${delta - margin}px`;
  }

  if (rect.top < 0) {
    element.style.top = `${margin}px`;
  }

  if (rect.bottom > window.innerHeight) {
    element.style.bottom = `${margin}px`;
  }
}

const converter = new showdown.Converter({
  simplifiedAutoLink: true,
  simpleLineBreaks: true,
  openLinksInNewWindow: true,
});

// NOTE: sanitizing by default removes target="_blank"
DOMPurify.addHook('afterSanitizeAttributes', function(node: any) {
  if ('target' in node) {
    node.setAttribute('target', '_blank');
  }
});

export function convertAndSanitizeMarkdown(markdown: string) {
  const html = converter.makeHtml(markdown);
  const sanitized = DOMPurify.sanitize(html);

  return sanitized;

}


// https://stackoverflow.com/questions/45408920/plain-javascript-scrollintoview-inside-div
export function scrollIntoViewOfParent(parent: Element, child: Element) {
 // Where is the parent on page
  const parentRect = parent.getBoundingClientRect();
  // What can you see?
  const parentViewableArea = {
    height: parent.clientHeight,
    width: parent.clientWidth
  };

  // Where is the child
  const childRect = child.getBoundingClientRect();
  // Is the child viewable?
  const isViewable = (
    childRect.top >= parentRect.top
  ) && (
    childRect.top <= parentRect.top + parentViewableArea.height
  );

  // if you can't see the child try to scroll parent
  if (!isViewable) {
    // scroll by offset relative to parent
    const amount = childRect.top - parentRect.top - (parentViewableArea.height / 2);

    parent.scrollBy({ top: amount, behavior: 'smooth' });
  }
}
