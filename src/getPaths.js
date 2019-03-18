const { join } = require('path');

module.exports = function(cwd) {
  const absMockPath = join(cwd, 'mock');
  const absConfigPath = join(cwd, '.mock.js');
  const absConfigPathWithTS = join(cwd, '.mock.ts');
  return {
    absMockPath,
    absConfigPath,
    absConfigPathWithTS,
  };
}
