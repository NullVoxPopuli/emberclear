export function isElementWithin(element: HTMLElement, container: HTMLElement): boolean {
  var rect = element.getBoundingClientRect();
  var containerRect = container.getBoundingClientRect();

  const isVisible = (
    rect.top >= containerRect.top &&
    rect.left >= containerRect.left &&
    rect.bottom <= containerRect.bottom &&
    rect.right <= containerRect.right
  );

  return isVisible;
}

