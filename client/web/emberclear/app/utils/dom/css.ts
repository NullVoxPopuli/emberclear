export function valueOfProperty(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--${name}`)
    .trim()
    .split(/px|rem/)[0];
}
