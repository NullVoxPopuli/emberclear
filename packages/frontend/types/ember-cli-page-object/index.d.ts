type Options = {
  multiple?: boolean;
};

type EventOptions = {
  eventProperties: {
    keyCode: number;
  };
};

export function create(page: object): any;
export function collection(selector: string, page: object): any;
export function clickable(selector?: string): any;
export function isVisible(selector?: string, options?: Options): boolean;
export function fillable(selector?: string): any;
export function text(selector?: string): string;
export function count(selector?: string): number;
export function is(selector?: string): boolean;
export function property(selectorOrProperty?: string, selector?: string): string;
export function hasClass(className: string): boolean;
export function isPresent(selector?: string): boolean;
export function triggerable(keyEvent: string, selector?: string, options?: EventOptions): any;
