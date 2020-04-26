import { TestModel } from '@xstate/test';

export function setupXStateTest(hooks: NestedHooks, testModel: TestModel<unknown, any>): void;
export function testShortestPaths(
  testModel: TestModel<unknown, any>,
  callback: (assert: Assert, path: any) => boolean
): void;
