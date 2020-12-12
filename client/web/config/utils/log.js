/* eslint-disable no-console */
'use strict';

function logWithAttention(...thingsToLog) {
  let longestLength = Math.max(thingsToLog.map((str) => str.length || 0)) || 80;

  let divider = '-'.repeat(longestLength);

  console.log(divider);

  for (let data of thingsToLog) {
    console[typeof data === 'string' ? 'log' : 'dir'](data);
  }

  console.log(divider);
}

module.exports = { logWithAttention };
