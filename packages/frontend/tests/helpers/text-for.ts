import Service from '@ember/service';
import { getContext } from '@ember/test-helpers';

export const textFor = (selector: string): string => {
  const context = getContext();

  const element = context.element.querySelector(selector);
  const content = element && element.textContent;
  const text = content && content.trim();

  return text;
};

export default textFor;
