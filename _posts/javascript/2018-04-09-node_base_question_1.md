---
categories: javascript
layout: post
title: Node基础问题及其分析
---

#### 一、Node的单线程编程模型有哪些缺点？
1. 单线程无法利用多核CPU
2. 错误会引起整个应用退出
3. 大量计算会占用CPU导致无法继续调用异步I/O，已调用的异步I/O回调也得不到及时的执行。

#### 二、在Node中如何导出一个function模块。
> 注意模块导出时exports和module.exports的用法区别。这两个对象都是JavaScript进行模块编译后通过外层的包装函数传递给模块的。我们知道JavaScript的函数参数都是形式参数，即函数内部改变形参的引用，函数外部不受影响。所以要将模块导出成一个function就只能通过赋值形式参数module的exports属性，而不能直接改变形式参数exports的值。

```javascript
// 1. 直接给module的exports对象添加属性。
exports.a = 'a';
exports.b = function () {}
// 等同于
module.exports.a = 'a';
module.exports.b = function() {}
// 等同于
module.exports = {
    a: 'a',
    b: function() {}
}

// 2. 如果要将模块导出成一个函数
exports = function() {} 
// 这是不可以的，因为exports是形参，直接赋值无法改变外部module.exports的值

// 只能通过如下方式，虽然module也是形参，但是我们是改变module对象内部的属性值，
// 外部module被改变，和exports.a = 'a'一个意思。
module.exports = function() {}
```

#### 三、请说出下列console的顺序。

```javascript
console.log('script start'); // 1 

setTimeout(function() {
    console.log('setTimeout'); // 5
}, 0);

Promise.resolve().then(function() {
    console.log('promise1'); // 3
}).then(function() {
    console.log('promise2'); // 4
});

console.log('script end'); // 2
```
JS中的任务分为macrotask以及microtask。
1. macrotask包括主代码块、setTimeout以及setInterval事件等，总之事件队列中的每一个事件都是macrotask。
2. microtask包括Promise产生的回调，process.nextTick等，**注意只有Promise的polyfill不是microtask，是setTimeout模拟的，属于macrotask。**

* macrotask放在事件队列中，由事件触发线程维护；
* microtask中的所有微任务都是添加到微任务队列（Job Queues）中，由JS引擎线程维护。

----
**运行机制：**
1. 执行一个宏任务（栈中没有就从事件队列中获取）
2. 执行过程中如果遇到微任务，就将它添加到微任务的任务队列中
3. 宏任务执行完毕后，立即执行当前微任务队列中的所有微任务（依次执行）
4. 依次往复

#### 四、Node中有哪些方法解决异步协作

1. 实际上回调嵌套也可以解决异步协作，回调嵌套的本质就是让依赖的事件永远放在被依赖事件之后执行。所以往往回调嵌套用来解决两个异步之间有数据依赖的情况。所以多个异步实际上是串行。

    ```javascript
    fs.readFile(path, function(err, data1) {
        db.query(sql, function(err, data2) {
            // 串行
        })
    });
    ```

2. 但是有的时候多个异步任务之间彼此没有依赖关系，所以实际上这几个没有依赖关系的任务是可以并行执行的，只是后续的某个任务需要同时依赖它们一起执行完。

    ```javascript
    fs.readFile(path, function(err, data1) {
        handle('data1', data1);
    });
    db.query(sql, function(err, data2) {
        handle('data2', data2);
    })

    // 1. 我们可以设置一个数据数组，只有等到两个数据都准备好才执行handle
    var datas = {};
    function handle(name, data) {
        // 不管哪个数据先到，只要另一个没到都先保存
        if (Object.keys(datas).length === 0) {
            datas[name] = data;
        } else {
            // 这个时候datas里面已经有另一个数据了，可以同时处理两个数据
        }
    }

    // 2. 当然上面的方式只能应对两个异步并行，而且datas变量和handle函数分离，
    // handle函数被污染，总之很多缺点。
    // 我们可以定义一个handle函数的高阶函数。利用闭包的特性隐藏计数和结果变量
    function after(times, callback) {
        var count = 0, results = {};
        return function(key, value) {
            results[key] = value;
            count ++;

            if (count === times) {
                callback(results);
            }
        }
    }
    // handle只关注业务
    function handle(datas) {}

    var done = after(2, handle);
    fs.readFile(path, function(err, data1) {
        done('data1', data1);
    });
    db.query(sql, function(err, data2) {
        done('data2', data2);
    })

    // 3. 还可以利用事件发布/订阅模式
    var emitter = new events.Emitter();
    var done = after(2, handle);
    emitter.on('done', done);

    fs.readFile(path, function(err, data1) {
        emitter.emit('done', 'data1', data1);
    });
    db.query(sql, function(err, data2) {
        emitter.emit('done', 'data2', data2);
    })    
    ```
3. async处理异步的方式，暴露出callback，异步调用成功之后调用callback，内部通过把数据保存起来，决定怎么继续调用其他的回调。得以实现串行，并行等。

    ```javascript
        async.series([ 
            function(callback) {
                fs.readFile(path, callback);
            }, 
            function(callback) {
                fs.readFile(path, callback);
            },
            function(callback) {
                fs.readFile(path, callback);
            },
        ], function(err, results) {

        });
    ```

#### 五、Node中的尾触发与next
> Node中的尾触发和next方式是koa服务器框架实现中间件的方法，在Java的世界里这种方式叫做面向切面编程，显然JavaScript在处理这种场景上显得更加的简单和优雅。

```javascript
function m1(next) {
    console.log('i am m1 before');
    next();
    console.log('i am m1 after');
}
function m2(next) {
    console.log('i am m2 before');
    next();
    console.log('i am m2 after');
}

function run() {
    var middlewares = [m1, m2];
    var index = 0;
    function next() {
        if (index < middlewares.length)
            middlewares[index++](next);
    }
    // 开始
    next();
}
run();
// > "i am m1 before"
// > "i am m2 before"
// > "i am m2 after"
// > "i am m1 after"
```

#### 六、简述以下V8的垃圾回收机制与算法。
1. 垃圾回收机制作用于V8分配的堆内存，因为垃圾回收会引起JavaScript线程暂停执行，以1.5G的垃圾回收堆内存为例，V8做一次小的垃圾回收需要50ms以上，做一次非增量式的垃圾回收甚至需要1s以上，所以V8对堆内存的分配有一个大小的限制，堆内存过大垃圾回收会影响应用性能和响应能力。64位系统下约分配1.4G，32位系统下约为0.7G。

2. 堆内存中的对象大小和存活时间不一样，如果采用统一的垃圾回收算法可能达不到最优的回收效率，所以针对不同特点的对象将它们分区域采用不同的回收算法效率会比较高。

3. 将存活时间短的对象采用Scavenge算法，即每次垃圾回收时将From内存中存活的对象复制到To内存中，然后将From清空，系统将对象都分配到To内存，然后交换From和To的角色。如此往复。由From和To组成的这部分内存称为新生代，是每次新对象被分配的地方，由于大多数的对象存活时间都很短，所以复制存活对象的效率相对较高。

4. 在某一次垃圾回收时，复制新生代From内存中的某个对象到To内存，如果这个对象已经在上一次回收被复制过或者此时To内存已经使用超过了25%，那么该对象直接晋升到老生代中。所以老生代中的对象一般都是存活时间较长的对象，将采用Mark-Sweep算法回收。即标记死亡的对象将其清空，然后整理内存为连续的。因为老生代中的对象一般存活时间比较长，所以处理的死亡对象的效率相对较高。











