---
categories: javascript
layout: post
title: JavaScript基础问题及其分析(二)
---

#### 一、在JavaScript中，setTimeout设定的定时任务为什么不一定准时？
> 考察对JavaScript异步编程和时间循环机制的了解。

* **当JavaScript主线程执行到setTimeout函数时，会启用定时器线程为setTimeout计时，当
到达指定的时间后会将setTimeout的回调函数放到事件循环队列中，如果此时排在该回调函数之前有比较耗时的其他事件需要执行，那么该setTimeout回调会等待较长时间从而延时。当然回调函数本身放入队列和从队列中取出也需要一定的时间，只是一般比较少可以忽略。**

```javascript
let current = Date.now();
setTimeout(function() {
  console.log('t1 start: ', Date.now() - current); // 1002
  for (let i=0; i<100000000; i++) {}
}, 1000);

setTimeout(function() { 
  console.log('t2 start: ', Date.now() - current); // 1065
}, 1000);
```

#### 二、如何解决web页面因主线程执行耗时事件导致页面卡顿的问题。

> 我们知道，JavaScript代码是单线程运行的，在web环境中，为了避免渲染页面的混乱，GUI渲染线程需要等到Js执行引擎线程的调用栈（注意不是事件队列为空）为空时进行。那么如果Js执行引擎线程执行耗时较大的任务时，页面会出现卡顿的现象，如何解决这种问题。 **

* **将耗时较多的任务分割成多个任务加入到事件队列，因为Js执行引擎线程和GUI渲染线程会交替执行，所以页面不会出现长时间卡顿的现象。**

```javascript
var res = [];
function handle(data) {
    var chunk = data.splice(0, 1000);
    res = res.concat(chunk.map(function(val) {
        // 处理数据
    }));

    if (data.length > 0) {
        // 将下一次批处理放入事件循环中，解放当前主线程，让GUI渲染线程得以执行的机会。
        setTimeout(function() {
            handle(data)
        }, 0); // 当然两个连续调用的setTimeout(...0)有可能不会按照顺序处理。
    }
}
```

#### 三、简述JavaScript程序的回调地狱产生的原因以及解决办法。
> JavaScript语言的特点就是异步编程，主线程执行代码的过程中会将某些耗时的操作交给其他对应的线程处理(比如有:事件触发线程、定时触发线程、I/O请求线程、GUI渲染线程等)。对应的线程处理好结果之后将主线程给它的回调函数放入到事件循环队列中，主线程会在适当的时候(当前执行栈中的所有任务执行完毕)去事件队列取出消息并执行(放入主线程执行栈中执行)。
这种代码运行的机制会导致一些代码在现在执行，一些代码在将来执行，这本身也没有什么问题，问题就出在如果这些将来执行的代码需要在时间上有先后顺序，那我们就必须想办法解决，一种简单的办法就是回调嵌套。

```javascript
document.addEventListener('click', function(evt) {
    setTimeout(function(){
        ajax('http://a.url', function(rep) {
            console.log(rep);
        });
    }, 1000);
});
```

当然也可以给每个回调函数取一个名字，在代码结构层面看着好看一些。

```javascript
document.addEventListener('click', click);

function click(evt) {
    // do something
    setTimeout(request, 1000);
}
function request() {
    // do somethig
    ajax('http://a.url', handleRep);
}
function handleRep(rep) {
    // do somethig
    console.log(rep);
}
```

这种方式不仅麻烦，需要给不必要具名的函数命名，而且可读性还不如回调嵌套，至少回调嵌套还更容易看出程序的先后顺序和依赖关系。

**异步编程的主要解决方案有如下三种：**
1. 事件发布/订阅模式；
2. Promise/Deferred模式；
3. 流程控制库。

#### 四、JavaScript异步编程风格有哪些难点。
1. 异常处理，因为有些异常不在当前try...catch之内抛出，而是等到事件循环执行时抛出。当前的try...catch无法捕获。
2. 函数嵌套过深。
3. 阻塞代码，没有办法让主线程sleep。
4. 单线程不能很好的利用多核处理器。

#### 五、简述JavaScript的Promise对象。
> Promise对象是JavaScript表示一个异步操作的最终完成及其结果值。

```javascript
// 创建一个Promise对象并给它一个篮子，篮子里面留两个放小碗的位置，一个碗用来放好苹果，一个碗用来放坏苹果。
// new Promise执行时，会分别把这两个碗放到我们给它的篮子里面给到我们。
var promise = new Promise(function(resolve, reject){
    // 我们在处理程序的过程当中，如果得到好苹果，就放到好碗里面.
    if (ok) resolve('好苹果');
    // 否则放到坏碗里面。
    else reject('坏苹果')
});

// 当我们将好苹果或者坏苹果放入碗中的时候，promise拿到苹果并且给我们。
promise.then(function(res){

}, function(error) {

})
```
通过以上的描述，貌似Promise有点儿多此一举，我们拿到异步结果的时候给到Promise，然后Promise立即又还给我们。就这一给一还的过程当中，摇身一变，原来需要写在回调里的代码可以写在回调的外面。实际上并不稀奇，不就是事件模型吗，发布订阅模型吗，先把一些需要执行的函数给你，你在什么时候拿到结果执行它们，其实就是这么简单。

```javascript
var promise = new Promise(function(resolve, reject){

    // 这里相当于emit成功事件并把数据给出。
    if (ok) resolve('好苹果');
    // 相当于emit失败事件并给出原因。
    else reject('坏苹果')
});

// 这里相当于注册两个事件的函数，一个事件是成功，一个事件失败
promise.then(function(res){

}, function(error) {

})
```

当然，原理虽然简单，但是Promise通过精巧的设计，可以使异步编码看起来非常的友好，特别是将then方法返回一个新的Promise对象以支持链式调用。

**Promise实现的几段关键代码：**

```javascript
function Promise(resolver) {
    this.value = null; // 保存苹果
    this.handlers = []; // 存放当拿到苹果时，需要回调的函数，

    // 它拿到我们给它的篮子，并放进两个碗
    resolver(function(val){
        // 好碗中放入苹果，调用所有需要回调的函数，把苹果给它们
        while (this.handlers.length) {
            var handler = this.handlers.shift();
            handler(this.value);
        }

    }, function(err){

    });
}

// 注册
Promise.prototype.then = function(handler){
    this.handlers.push(handler);
}
```

当然，真正的实现要比这个复杂得多，其中需要对不同的类型数据做不同的处理，需要管理Promise的状态，不能重复resolve或者reject。还需要将then方法返回新的Promise对象的等等。

#### 六、考虑一下Promise的输出顺序以及结果。

```javascript
var promise = new Promise(function(resolve, reject) {
    resolve(1);
});

promise.then(function(res) {
    console.log('then1:', res);
}).then(function(res){
    console.log('then2:', res);
})

promise.then(function(res) {
    console.log('then3:', res);
})

// then1: 1
// then3: 1
// then2: undefined
```

#### 七、JavaScript中有哪些内置的可迭代对象，如何实现自己的可迭代对象。
> 要成为可迭代对象， 一个对象必须实现 @@iterator 方法。目前所有的内置可迭代对象如下：String、Array、TypedArray、Map 和 Set，它们的原型对象都实现了 @@iterator 方法。

自定义对象的@@iterator方法：

```javascript
function fibonacci(n) {
    let i = 0;
    let count = n >>> 0;
    function f(i) {
        if ( i === 0 || i === 1) return i;
        return f(i-2) + f(i-1);
    }
    return {
        next: function() {
            if (i > count) {
                return { value: f(i), done: true };
            }
            return { value: f(i++), done: false };
        }
    }
}
let gen = fibonacci(4);
console.log(gen.next().value); // 0
console.log(gen.next().value); // 1
console.log(gen.next().value); // 1

// 定义一个obj的@@iterator方法，将obj变成可遍历对象
let obj = {
    [Symbol.iterator]: function() {
        return fibonacci(10);
    }
}
for (let o of obj) {
    console.log(o);
}

// 也可以使用生成器定义@@iterator方法
function fibonacciGen(n) {
    return function* () {
        let i = 0;
        let count = n >>> 0;
        function f(i) {
            if ( i === 0 || i === 1) return i;
            return f(i-2) + f(i-1);
        }
        while(i <= count) yield f(i++);
    }
} 

let obj2 = {
    [Symbol.iterator]: fibonacciGen(10) 
}
console.log(...obj2) // > 0 1 1 2 3 5 8 13 21 34 55
```
#### 八、使用ES6提供的生成器函数进行异步编程。
> ES6生成器函数会返回一个迭代器对象，当这个迭代器的 next() 方法被首次（后续）调用时，其内的语句会执行到第一个（后续）出现yield的位置为止，yield 后紧跟迭代器要返回的值。调用 next()方法时，如果传入了参数，那么这个参数会传给上一条执行的 yield语句左边的变量。利用这个特性如果yield后面是Promise对象，我们可以每次拿到Promise对象执行。

```javascript
function* generator() {
    yield Promise.resolve(1);
    yield Promise.resolve(2);
    yield Promise.resolve(3);
}

let gen = generator();
let p;
while((p=gen.next()).done === false) {
    p.value.then(function(v) {
        console.log(v); // 1, 2, 3
    })
}

// 我们知道，调用 next()方法时，如果传入了参数，那么这个参数会传给上一条执行的 yield语句左边的变量
function* generator() {
    let a = yield Promise.resolve(1);
    let b = yield Promise.resolve(2);
    let c = yield Promise.resolve(3);

    console.log(a, b, c); // 1, 2, 3
}

// co 库的简易版本
function wrap(generator) {
    let gen = generator();

    function next(value) {
        let n = gen.next(value);
        if (n.done === false) {
            // 当前Promise的值传入next方法，
            // 调用gen.next时赋值给上一个yield语句的左边变量
            n.value.then(next); 
        }
    };
    // 开始执行
    next();
}

wrap(generator);
```

#### 九、for...of与for...in的区别。
> **for...in语句以任意顺序遍历一个对象的除Symbol以外的可枚举属性。**

```javascript
Object.prototype.a = '1';
let obj = { b: '2' };
for (let p in obj) {
    console.log(p); // b, a
}

// 当使用for...in遍历数组时,遍历的是数组的索引(因为所以是数组对象的可枚举属性)
let a = ['a', 'b', 'c'];
for (let p in a) {
    console.log(p); // 0, 1, 2
}
```

> **for...of 语句遍历可迭代对象定义要迭代的数据。**

```javascript
// 1. for...of 不能遍历不可迭代对象，如object

// 2. 使用for...of遍历可迭代对象，如String，Map，Array，TypedArray，Set
let a = ['a', 'b', 'c'];
for (let v of a) {
    console.log(v); // a, b, c
}

// 3. 使用for...of遍历自定义可迭代对象
let obj = {
    [Symbol.iterator]: function() {
        let [pre, current] = [0, 1];
        return {
            next: function() {
                [pre, current] = [current, pre + current];
                return { value: current, done: false };
            }
        }
    }
};
for (let i of obj) {
    console.log(i);
    if (i >= 1000)  break;
}

// 4. 使用for...of遍历生成器，因为生成器对象既是迭代器，也是可迭代对象。
function* f() {
    let [pre, current] = [0, 1];
    while(true) {
        [pre, current] = [current, pre + current];
        yield current;
    } 
}
for (let i of f()) {
    console.log(i);
    if (i >= 1000)  break;
}

// 5. 生成器也可以作为一个对象的迭代器
let obj = {
    [Symbol.iterator]: function* f() {
        let [pre, current] = [0, 1];
        while(true) {
            [pre, current] = [current, pre + current];
            yield current;
        } 
    }
};
for (let i of obj) {
    console.log(i);
    if (i >= 1000)  break;
}
```




