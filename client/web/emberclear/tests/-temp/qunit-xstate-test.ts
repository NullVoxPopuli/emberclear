/* eslint-disable */
import { module, test } from 'qunit';
import { TestModel } from '@xstate/test';
import { TestPlan } from '@xstate/test/lib/types';
import { TestContext as EmberTestContext } from 'ember-test-helpers';

type TestCallbackFn<TestContext, TContext, TReturn> = (
  this: EmberTestContext,
  assert: Assert,
  path: TestPlan<TestContext, TContext>['paths'][0]
) => TReturn;

export const testShortestPaths = <TestContext, TContext, TReturn>(
  testModel: TestModel<TestContext, TContext>,
  testCallback: TestCallbackFn<TestContext, TContext, TReturn>
) => {
  testModel.getShortestPathPlans().forEach((plan) => {
    module(plan.description, function () {
      plan.paths.forEach((path) => {
        test(path.description, function (assert) {
          return testCallback.bind(this)(assert, path);
        });
      });
    });
  });
};
