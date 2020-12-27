export function prev<T>(arr: T[], value: T) {
  let currentIndex = arr.indexOf(value);
  let maybePrev = currentIndex - 1;
  let prevIndex = maybePrev < 0 ? arr.length - 1 : maybePrev;
  let element = arr[prevIndex];

  return element;
}

export function next<T>(arr: T[], value: T) {
  let currentIndex = arr.indexOf(value);
  let maybeNext = currentIndex + 1;
  let nextIndex = maybeNext === arr.length ? 0 : maybeNext;
  let element = arr[nextIndex];

  return element;
}
