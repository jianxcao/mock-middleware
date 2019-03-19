var Koa = require('koa');
const { koa: koaMiddle } = require("../src/index");
const serve = require("koa-static");

var app = new Koa();

const errors = [];

app.use(koaMiddle({
  watch: true,
  cwd: __dirname,
  errors
}));


app.use(serve(__dirname + "/html"));

if (errors.length) {
  console.error(errors)
}


const server = app.listen(8018, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("应用实例，访问地址为 http://%s:%s", host, port)

})
