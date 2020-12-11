'use strict';

function configCreator(...overrides) {
  return () => createConfig(...overrides);
}

function createConfig(...overrides) {
  return {
    root: true,
    overrides: [...overrides.flat()],
  };
}

module.exports = { configCreator, createConfig };
