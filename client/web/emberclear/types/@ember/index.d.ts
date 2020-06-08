declare module '@ember/test-waiters' {
  type WaitForPromise = (x: any) => PromiseLike<void>;

  export const waitForPromise: WaitForPromise;
}

declare module '@ember/destroyable' {
  export const associateDestroyableChild: any;
  export const registerDestructor: any;
}
