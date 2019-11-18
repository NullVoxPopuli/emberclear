const COMPONENT_REGEX = /<([A-Z][\w:]+)([.]+)?(>|(\/>)?)[^\(]?/g;

module.exports = {

  componentsInContent(contents) {
    let result = [];
    let matches = contents.matchAll(COMPONENT_REGEX);

    for (let match of matches) {
      let componentName = match[1];

      result.push(componentName);
    }

    return result;
  }

};
