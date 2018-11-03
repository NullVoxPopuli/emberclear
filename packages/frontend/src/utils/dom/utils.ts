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
