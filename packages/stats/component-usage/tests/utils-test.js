import { module, test } from 'qunit';
import { componentsInContent } from '../lib/utils';

const componentContents = [
  {
    src: `<Foo>`,
    components: ['Foo']
  },
  {
    src: `<Foo />`,
    components: ['Foo']
  },
  {
    src: `<Foo @arg={{2}} />`,
    components: ['Foo']
  },
  {
    src: `<Foo
            @arg={{2}}
          />`,
    components: ['Foo']
  },
];

module('componentsInContent', function() {
  componentContents.forEach(( scenario, i ) => {
    let { src, components } = scenario;

    test(`for scenario: ${i}`, function(assert) {
      let result = componentsInContent(src);

      assert.deepEqual(result, components);
    });
  });
});
