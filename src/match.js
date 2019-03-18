const chokidar = require( 'chokidar');
const signale = require( 'signale');
const matchMock = require( './matchMock');
const { getMockData } = require( './getMockData');
const getPaths = require( './getPaths');
const {noop} = require('./utils');
const debug = require('debug')('mock:createMiddleware');

module.exports = function(opts = {}) {
  const {
    cwd,
    errors = [],
    config,
    watch,
    onStart = noop,
  } = opts;
  const { absMockPath, absConfigPath, absConfigPathWithTS } = getPaths(cwd);
  const mockPaths = [absMockPath, absConfigPath, absConfigPathWithTS];
  const paths = [
    ...mockPaths,
  ];
  let mockData = null;

  // registerBabel 和 clean require cache 包含整个 src 目录
  // 而 watch 只包含 pages/**/_mock.[jt]s
  onStart({ paths });
  fetchMockData();

  if (watch) {
    // chokidar 在 windows 下使用反斜杠组成的 glob 无法正确 watch 文件变动
    // ref: https://github.com/paulmillr/chokidar/issues/777
    const watcher = chokidar.watch([...mockPaths], {
      ignoreInitial: true,
    });
    watcher.on('all', (event, file) => {
      debug(`[${event}] ${file}, reload mock data`);
      errors.splice(0, errors.length);
      cleanRequireCache();
      fetchMockData();
      if (!errors.length) {
        signale.success(`Mock files parse success`);
      }
    });
  }

  function cleanRequireCache() {
    Object.keys(require.cache).forEach(file => {
      if (
        paths.some(path => {
          return file.indexOf(path) > -1;
        })
      ) {
        delete require.cache[file];
      }
    });
  }

  function fetchMockData() {
    mockData = getMockData({
      cwd,
      config,
      onError(e) {
        errors.push(e);
      },
    });
  }

  return function (req) {
    const match = mockData && matchMock(req, mockData);
    if (match) {
      debug(`mock matched: [${match.method}] ${match.path}`);
      return match;
    }
  };
}
