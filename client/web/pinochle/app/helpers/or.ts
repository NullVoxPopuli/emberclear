export function or<T = unknown>(...elements: T[]) {
  return elements.some((element) => Boolean(element));
}
