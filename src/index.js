const match = require('./match');
const multer = require('multer');
const BODY_PARSED_METHODS = ['post', 'put', 'patch', 'delete'];
const parse = require('co-body');
const { noop, isJSON } = require('./utils')

const bodyDetail = async function (req, res, callback = noop) {
    const method = req.method.toLowerCase()
    if (BODY_PARSED_METHODS.includes(method)) {
        const body = await parse(req);
        req.body = Object.assign({}, req.body, body);
        callback();
    }
};


const fileParse = function (req, res, callback = noop) {
    return new Promise(function (resolve, reject) {
        multer().any()(req, res, () => {
            callback();
            resolve();
        });
    });
};

exports.koa = function (opt) {
    const mo = match(opt);
    return async function (ctx, next) {
        const result = mo(ctx.request);
        // 匹配到结果
        if (result) {
            const handler = result.handler;
            // req参数解析
           await bodyDetail(ctx.request, ctx.response);
           if (typeof handler === 'function') {
                await fileParse(ctx.request, ctx.response);
                return await handler(ctx.request, ctx.response, next);
           }
           return ctx.body = handler;
        }
        await next();
    }
}

exports.koa1 = function (opt) {
  const mo = match(opt);
    return function* (next) {
        const ctx = this;
        const result = mo(ctx.request);
        if (result) {
            let handler = result.handler;
            yield bodyDetail(ctx.request, ctx.response);
            if (typeof handler === 'function') {
              yield fileParse(ctx.request, ctx.response);
              yield Promise.resolve(handler(ctx.request, ctx.response, next));
              return;
           }
           return ctx.body = handler;
        }
        yield next;
    }
}

exports.express = function () {
    return function (req, res, next) {
        const result = mo(req);
        if (result) {
            const handler = result.handler;
            bodyDetail(req, res, () => {
                if (typeof handler === 'function') {
                  fileParse(req, res, () => {
                    return handler(req, res, next)
                  });
               }
               return res.json ? res.json(handler) : res.body = handler;
            });
        } else {
          next();
        }
    }
}

exports.parse = match;
