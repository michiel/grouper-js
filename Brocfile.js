var dist = require('broccoli-dist-es6-module');

module.exports = dist('lib', {
  main        : 'grouper',
  global      : 'Grouper',
  packageName : 'grouper',
  shim        : { }
});
