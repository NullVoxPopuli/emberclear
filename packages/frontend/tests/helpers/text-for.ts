import { getContext } from '@ember/test-helpers';

export const textFor = (selector: string): string => {
  const context = getContext() as any;
  const root = context.element;

  const element = root.querySelector(selector);
  const content = element && element.textContent;
  const text = content && content.trim() || '';

  return text;
};


export function text(elements: Element[]): string {
  return Array.from(elements).map(e => e.textContent.trim()).join();
}

export default textFor;
