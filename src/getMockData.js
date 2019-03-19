const { existsSync } = require('fs');
const assert = require('assert');
const pathToRegexp = require('path-to-regexp');
const { join } = require('path');
const signale = require('signale');
const glob = require('glob');
const getPaths = require('./getPaths');
const { noop } = require('./utils');

const debug = require('debug')('mock:getMockData');
const VALID_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

function parseKey(key) {
  let method = 'get';
  let path = key;
  if (key.indexOf(' ') > -1) {
    const splited = key.split(' ');
    method = splited[0].toLowerCase();
    path = splited[1]; // eslint-disable-line
  }
  assert(
    VALID_METHODS.includes(method),
    `Invalid method ${method} for path ${path}, please check your mock files.`,
  );
  return {
    method,
    path
  };
}


function getMockFiles(opts) {
  const { cwd, config = {} } = opts;
  const { absMockPath, absConfigPath, absConfigPathWithTS } = getPaths(cwd);

  if (existsSync(absConfigPathWithTS)) {
    debug(`Load mock data from ${absConfigPathWithTS}`);
    return [absConfigPathWithTS];
  } else if (existsSync(absConfigPath)) {
    debug(`Load mock data from ${absConfigPath}`);
    return [absConfigPath];
  } else {
    let mockFiles = glob
      .sync('mock/**/*.[jt]s', {
        cwd,
        ignore: (config.mock || {}).exclude || []
      })
      .map(p => join(cwd, p));
    debug(
      `load mock data from ${absMockPath}, including files ${JSON.stringify(
        mockFiles,
      )}`,
    );
    return mockFiles;
  }
}

function getMockConfigFromFiles(files) {
  return files.reduce((memo, mockFile) => {
    try {
      const m = require(mockFile); // eslint-disable-line
      memo = {
        ...memo,
        ...(m.default || m)
      };
      return memo;
    } catch (e) {
      throw new Error(e.stack);
    }
  }, {});
}

function getMockConfig(opts) {
  const files = getMockFiles(opts);
  debug(`mock files: ${files.join(', ')}`);
  return getMockConfigFromFiles(files);
}

function normalizeConfig(config) {
  return Object.keys(config).reduce((memo, key) => {
    const handler = config[key];
    const type = typeof handler;
    assert(
      type === 'function' || type === 'object',
      `mock value of ${key} should be function or object, but got ${type}`,
    );
    const { method, path } = parseKey(key);
    const keys = [];
    const re = pathToRegexp(path, keys);
    memo.push({
      method,
      path,
      re,
      keys,
      handler
    });
    return memo;
  }, []);
}

function getMockData(opts) {
  const { onError = noop } = opts;
  try {
    return normalizeConfig(getMockConfig(opts));
  } catch (e) {
    onError(e);
    signale.error('Mock files parse failed');
  }
}
module.exports = {
  getMockFiles,
  getMockConfigFromFiles,
  getMockConfig,
  normalizeConfig,
  getMockData
};
