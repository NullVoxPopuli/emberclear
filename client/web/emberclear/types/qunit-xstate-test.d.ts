import type { TestModel } from '@xstate/test';
import type { TestContext } from 'ember-test-helpers';

export function setupXStateTest(hooks: NestedHooks, testModel: TestModel<unknown, any>): void;
export function testShortestPaths(
  testModel: TestModel<unknown, any>,
  callback: (this: TestContext, assert: Assert, path: any) => Promise<boolean>
): void;
