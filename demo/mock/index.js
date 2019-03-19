module.exports = {
    // Support type as Object and Array
    'GET /api/users': {
      users: [1, 2]
    },
    
    'GET /api/params': (req, res, next) => {
      console.log(req.query);
      res.body = {
        id: 225672
      }
    },
    // Method like GET or POST can be omitted
    '/api/users/1': {
      id: 1
    },
    'GET /api/uses/45': {
      code: 0,
      data: [],
      msg: '323'
    },
    'GET /api/:id': (req, res, next) => {
      res.body = {
        id: req.params.id
      };
  
    },
  
    'POST /api/users': (req, res, next) => {
      res.body = {
        id: 222
      }
    },
    'POST /api/other': (req, res, next) => {
      res.body = {
        id: 222
      }
    }
  };
  