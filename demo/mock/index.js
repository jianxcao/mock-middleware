module.exports = {
  // Support type as Object and Array
  'GET /api/users': {
    users: [1, 2],
  },

  // Method like GET or POST can be omitted
  '/api/users/1': {
    id: 1,
  },
  'GET /api/uses/45': {
    code: 0,
    data: [],
    msg: '323',
  },
  'GET /api/:id': async (req, res) => {
    res.body = {
      id: req.params.id,
    };
  },

  'POST /api/users': async (req, res) => {
    await sleep(3000);
    res.body = {
      id: 222,
    };
  },
  'POST /api/other': async (req, res) => {
    await sleep(3000);
    res.body = {
      id: 222,
    };
  },
};

function sleep() {
  return new Promise(function(res, rej) {
    setTimeout(function() {
      res();
    }, 3000);
  });
}
