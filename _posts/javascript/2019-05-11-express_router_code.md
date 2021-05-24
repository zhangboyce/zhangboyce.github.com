---
categories: javascript
layout: post
title: express的router实现原理分析
---

> express的router实现往简单来讲就是两类数组，第一类数组全局之后一个，用于保存所有添加到app中的路由以及中间件(实际上在express中中间件也是一种路由)，第二类数组用于保存每个路由上添加的中间件。

```javascript
app.get('/page1', function(req, res) {});
app.post('/page2', function(req, res, next){}, function(req, res) {});
```

通过以上方式添加的路由调用以下代码:

```javascript
// application.js
methods.forEach(function(method){
  app[method] = function(path){

    // 1. 根据路径创建一个路由并将该路由保存到router的数组中，见 1.1
    var route = this._router.route(path);
    // 2. 在该路由中再次创建一个数组，用于保存该路由对应的处理方法以及中间件，见 2.1
    route[method].apply(route, slice.call(arguments, 1));
    return this;
  };
});

// router/index.js
// 1.1
proto.route = function route(path) {
  var route = new Route(path);

  // 路由数组中的Layer主要就行path的匹配，参数解析等等
  var layer = new Layer(path, {
      sensitive: this.caseSensitive,
      strict: this.strict,
      end: true

      // 这个dispatch是遍历对应的路由上的方法执行，见1.1.1
  }, route.dispatch.bind(route));

  layer.route = route;

  this.stack.push(layer);
  return route;
};

// router/route.js
// 2.1
methods.forEach(function(method){
  Route.prototype[method] = function(){
    var handles = flatten(slice.call(arguments));

    for (var i = 0; i < handles.length; i++) {

        // 真正的添加到路由上面的方法和中间件被保存到这个数组中的Layer中
        var handle = handles[i];
        var layer = Layer('/', {}, handle);
        layer.method = method;

        this.methods[method] = true;
        this.stack.push(layer);
    }

    return this;
  };
});

// router/route.js
// 1.1.1
Route.prototype.dispatch = function dispatch(req, res, done) {
  var idx = 0;
  var stack = this.stack;
  next();

  function next(err) {
    // 见 1.1.1.1
    layer.handle_request(req, res, next);    
  }
};

// router/layer.js
// 1.1.1.1
Layer.prototype.handle_request = function handle(req, res, next) {
  var fn = this.handle;
  // 调用真正的handle
  fn(req, res, next);
};
```
以上就是路由添加的基本流程，保留了主要的代码。下面看一下路由匹配的过程。主要代码就是遍历router中的Layer。

```javascript
// router/index.js
// express接收到请求之后就是调用这个方法进行路由匹配的
proto.handle = function handle(req, res, out) {
  var self = this;
  var idx = 0;
  // middleware and routes
  var stack = self.stack;
  next();

  function next(err) {
    // find next matching layer
    var layer;
    var match;
    var route;

    // 直到匹配到一个或者stack被遍历完为止
    while (match !== true && idx < stack.length) {
      layer = stack[idx++];
      match = matchLayer(layer, path);
      route = layer.route;

      // 如果当前Layer和path不匹配，继续匹配
      if (match !== true) {
        continue;
      }

      // 通过app.use或者router.use添加的中间件route=undefined，
      // 但是此时match=true，详见Layer的match实现。
      // 所以app.use或者router.use添加的中间件都可以被匹配到。
      if (!route) {
        continue;
      }
    }

    // no match
    if (match !== true) {
      return done(layerError);
    }
    // 如果最终匹配到一个Layer就执行它，并且把next方法传给我们，
    // 我们在处理完我们中间
    // 件的业务之后需要调用next方法while循环才会继续执行以匹配其他的中间件和路由。
    layer.handle_request(req, res, next);
  }
```

以上就是express的路由添加和匹配的核心流程和代码，当然删去了很多复杂的细节只留下了主要流程，此外express还可以通过app.use、app.param、route.all等等方式添加路由，基本的逻辑都是一样的，不再赘述。









