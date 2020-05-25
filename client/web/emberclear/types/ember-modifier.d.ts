interface ModifierArgs {
  positional: unknown[];
  named: { [key: string]: unknown };
}

interface IModifier<Args extends ModifierArgs = ModifierArgs> {
  args: Args;
  element: Element | null;
  isDestroying: boolean;
  isDestroyed: boolean;
  didReceiveArguments(): void;
  didUpdateArguments(): void;
  didInstall(): void;
  willRemove(): void;
  willDestroy(): void;
}

type Owner = unknown;

declare module 'ember-modifier' {
  export default class Modifier<Args extends ModifierArgs = ModifierArgs>
    implements IModifier<Args> {
    args: Args;
    element: Element | null;
    isDestroying: boolean;
    isDestroyed: boolean;
    constructor(owner: Owner, args: Args);
    didReceiveArguments(): void;
    didUpdateArguments(): void;
    didInstall(): void;
    willRemove(): void;
    willDestroy(): void;
  }
}
