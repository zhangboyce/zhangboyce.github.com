---
categories: javascript
layout: post
title: JavaScript基础问题及其分析(一)
---

#### 一、简述JavaScript语言中var、let以及const关键字定义变量的特点。
> 这个问题主要是考察对JavaScript语言中作用域的理解，以及对最新的ES6的语法的熟悉程度。
> 同时通过const关键字考察对JavaScript的栈内存和堆内存的理解。

* **var关键字定义的变量不支持块级作用域以及在当前作用域内存在变量提升的性质。**
```javascript
function f() {
    console.log(a); // undefined
    var a = 'a';
    if (true) {
        var a = 'b';
    }
    console.log(a); // b
}
f();
console.log(a); // Error: a is not defined
```

* **相应的，let和const关键字定义的变量提供块级作用域以及不存在变量提升的现象**
```javascript
function f() {
    console.log(a); // Error: Cannot access 'a' before initialization
    let a = 'a';
    if (true) {
        let a = 'b';
    }
    console.log(a); // a
}
f();
```

* **如果在顶级作用域中用var定义一个变量，该变量将被定义成顶级对象(浏览器环境中为***window***，node环境中为***global***)的一个同名属性。而let和const定义的变量没有这个特点。**

* **使用const关键字定义的常量其引用（栈内变量的引用地址）只读，值有可能（如果类型是object）被改变**
```javascript
function f() {
    console.log(a); // Error: Cannot access 'a' before initialization
    let a = 'a';
    if (true) {
        let a = 'b';
    }
    console.log(a); // a
}
f();
```


#### 二、理解JavaScript中的作用域以及变量提升。
> 这个问题主要考察对作用域的理解，以及var关键字定义的变量提升性质及其本质，并且在使用var关键字编写代码的一些
> 注意事项。如for循环中使用var关键字定义变量的注意事项等。

* 作用域：其实很难给作用域一个明确的定义，一般来讲，在JavaScript中作用域是指负责收集和维护并且实施一套严格的规则确定这些变量在当前执行代码的访问权限。

* 变量提升：所谓的变量提升就是指在JavaScript中，所有的变量和函数的声明都会在执行之前被优先处理。表现形式就是
好像变量和函数声明的代码被移动到了当前作用域的最前面，这个过程叫做提升。

思考以下代码的输出：
```javascript
console.log(a);
var a = 2;
```

#### 三、在同JavaScript编写程序的过程中，怎么尽量避免污染顶级对象。
> 主要考察JavaScript的基础，作用域的概念以及在编写前端代码中的一些良好编码习惯。

1. **在node环境中以及在支持ES6语法的浏览器环境中尽量使用let和const关键字定义变量。**
2. **为不需要外部访问且需要定义在顶层的变量和方法，提供一个匿名立即执行函数作为封闭的作用域。**
3. **为需要暴露的变量和方法提供特定的命名空间。**

#### 四、在JavaScript中this关键字指的是什么？
> 考察JavaScript的基础。甚至通过this关键字的作用可以看出JavaScript的编程哲学。

**在JavaScript函数被调用时，会创建一个执行上下文，这个上下文会包含函数的调用信息，比如函数在哪里被调用，
函数调用的方法，传入的参数等等。this就是执行上下文中的一个属性，在函数执行的过程中可以使用到。**

* 在非严格模式下，JavaScript引擎在调用独立的函数时，函数执行上下文中的this指向全局对象。

```javascript
function f() {
    console.log(this.a); 
}
var a = 3;
f(); // 3

function f() {
    'use strict';
    console.log(this.a);  
}
var a = 3;
f(); // TypeError: this is undefined
```

* 当函数的引用有上下文对象时，JavaScript引擎在调用该函数时，函数执行上下文中的this指向该对象。

```javascript
function f() {
    console.log(this.a); 
}
var obj = {
    a: 2,
    f: f
};

obj.f(); // 2
```

值得注意的是，在某些情况下，函数的引用对象会丢失。比如：将对象的函数传递给一个变量或者另一个函数的参数。
所以从某种意义上讲，无论一个对象的函数是直接定义的还是引用其他的地方声明的函数，该函数都不属于该对象所有，
一旦“离开它”就不属于它。

```javascript
function foo() {
    console.log(this.a);
}

var a = "I am global";
var obj = { 
    a: "I am foo", 
    foo: foo, 
    foo2: function() { 
        console.log(this.a) 
    } 
};

foo(); // I am global 
obj.foo(); // I am foo

var bar = obj.foo;
bar(); // I am global 

var bar2 = obj.foo2; // I am global 
bar2();

setTimeout(obj.foo, 1000); // I am global 
```

#### 五、分别阐述一下JavaScript中Function对象的call、apply以及bind方法的作用以及使用场景。
> 主要考察对JavaScript中this的理解。

我们知道，在JavaScript中function内部的this变量一般情况下属于引用它的对象，但是如果将一个对象的function属性赋值给一个变量或者作为一个方法参数传递给另外一个函数，那么执行引擎在执行这个function的时候会丢失其宿主对象，function内部的this变量会指向全局对象。这种现象在很多情况下都会引起混乱。

* **Function对象的call、apply和bind方法都是用来强制将一个function绑定到一个对象上。区别在于它们的应用场景的不同。**

```javascript
function foo(b, c) {
    console.log(this.a + b + c);
}
var obj = { a: 1, foo: foo };

// 以下三种调用方式结果没有任何区别
foo.call(obj, 2, 3);
foo.apply(obj, [2, 3]);
obj.foo(2, 3);

// 假如这个对象也想使用foo方法，那么只能通过call或者apply调用。
// 因为obj2对象上面并没有foo方法。
// 这就是js的语言特性之一，一个function不必隶属于某一个对象，它们之间的关系是松散的。
// 理解Array.prototype.slice.call(arguments) 蕴含的编程哲学。
var obj2 = { a: 1 };
foo.call(obj2, 2, 3);
foo.apply(obj2, [2, 3]);

// 将一个对象bind到一个function上，这样该function不管只赋值给其他变量还是作为参数传递，
// 都不会丢失它的所谓的宿主对象（如果有的话）。
var bar = foo.bind(obj);
var bar2 = foo.bind(obj2);

// ES5提供的Function.prototype.bind实现类似如下
Fcuntion.prototype.bind = function(obj) {
    return function() {
        this.apply(obj, arguments);
    }
}
```
* **因为Function.prototype.bind方法可以预先传递函数的参数值，所以我们很容易用bind方法构造偏函数。**

```javascript
function mul(a, b) {
    return a * b;
}

var double = mul.bind(null, 2);
double(3); // 6
double(4); // 8

var triple = mul.bind(null, 3);
triple(3); // 9
triple(4); // 12

```

* **我们可以使用apply方法将一个数组参数传递给一个可以接受可变参数列表的方法，ES6之后可以用解构。**

```javascript
var array = [];

// Array的push方法接受可变参数
array.push(1,2);

var array2 = [3,4];
array.push(array2); // [1,2,[3,4]]

array.push.apply(array, array2); //  [1,2,[3,4],3,4]

// ES6
array.push(...array2);
```

#### 六、阐述Function.prototype.apply.bind(Array.prototype.slice)(arguments)涉及的知识点。
> 考察对JavaScript中prototype的理解，slice函数的应用，类数组对象，bind、apply方法等。

#### 七、在JavaScript中使用new关键字调用一个function执行的操作有哪些？
1. 创建一个全新对象；
2. 这个新对象会被执行原型链接；
3. 这个新对象会被绑定到该函数调用的this；
4. 如果函数没有返回其他对象，那么new表达式中的函数调用会自动返回这个新对象。

#### 八、使用Object.create方法创建对象和使用字面量方法创建对象有什么区别。
> 考察对Object.create方法的理解以及对js原型知识的掌握。

```javascript
var a = {};
Object.getPrototypeOf(a) === Object.prototype;

var b = Object.create(null);
Object.getPrototypeOf(b) === null;

var c = Object.create(a);
Object.getPrototypeOf(c) === a;
```

#### 九、JavaScript中for...in、Object.keys以及Object.getOwnPropertyNames分别获取对象的哪些属性。
> 考察对象属性操作方法。

1. for...in 返回对象所有的可枚举属性。
2. Object.keys 返回对象所有自身可枚举属性。
3. Object.getOwnPropertyNames 返回对象所有自身属性。

#### 十、instanceof关键字和Object.isPrototypeOf方法的区别。
> 考察js原型链的理解。

```javascript
A instanceof B // B.prototype是否存在于A的原型链上。
B.isPrototypeOf(A) // B 是否在A的原型链上。

```
1. A对象如果是由B function构造而来，也就是调用 new B()而来。那么B.prototype是一定存在于A的原型链上(除非手动修改)。即 A instanceof B。
2. isPrototypeOf 单纯的检查一个对象是否在另一个对象的原型链上。语义上没有构建与被构建的关系。

#### 十一、考虑以下代码，如果obj对象中没有但是obj的原型链中存在a属性，会发生哪些情况？
```javascript
obj.a = '2';
```
1. 如果在原型链上层存在普通的非只读访问属性，直接在obj中添加名为a的新属性，且下次访问obj.a直接屏蔽原型链上层的属性。
2. 如果在原型链上层存在普通的只读访问属性，那么无法修改已有属性且不能在obj中创建新属性。严格模式下会报错，否则忽略。
3. 如果原型链上存在a且是一个setter，一定会执行这个setter。a不会添加到obj也不会重新定义。

如果希望2、3两种情况也可以新建属性，就使用Object.defineProperty().

#### 十二、思考下面代码，解释一下为什么？
> 考察JavaScript中的原型链读取和修改属性的知识。 

```javascript
var obj1 = { a: 1 };
var obj2 = Object.create(obj1);

obj2.a ++;

obj1.a = 1;
obj2.a = 2;
obj2.hasOwnProperty('a') === true;
```

#### 十三、JavaScript中有哪些常用的方式实现原型继承。

* New-initialization    

```javascript
function p() { this.a = 1; }
p.prototype = { pv: 'pv' };

function c() { p.call(this); }
// 如果new p()是一个有副作用的调用，不适合。
c.prototype = new p();
c.prototype.constructor = c;
```

* Object.create()

```javascript
function p() { this.a = 1; }
p.prototype = { pv: 'pv' };

function c() { p.call(this); }
c.prototype = Object.create(p.prototype);
c.prototype.constructor = c;
```

* Object.setPrototypeOf()

```javascript
function p() { this.a = 1; }
p.prototype = { pv: 'pv' };

function c() { p.call(this); }
// 因为c.prototype没有被重置，所以不需要手动修复c.prototype.constructor属性。
Object.setPrototypeOf(c.prototype, p.prototype);
```

* \_\_proto\_\_

```javascript
function p() { this.a = 1; }
p.prototype = { pv: 'pv' };

function c() { p.call(this); }
// Object.setPrototypeOf的非标准版本。不建议使用。
c.prototype.__proto__ = p.prototype;
```

#### 十四、写出Object.create()方法的polyfill代码。
```javascript
if (!Object.create) {
    Object.create = function(o) {
        function F() {}
        F.prototype = o;
        return new F();
    }
}
```

#### 十五、JavaScript中一般用什么方式判断对象的类型。

```javascript
Object.prototype.toString.call(null);         // => "[object Null]"
Object.prototype.toString.call(undefined);    // => "[object Undefined]"
Object.prototype.toString.call(true);         // => "[object Boolean]"
Object.prototype.toString.call(1);            // => "[object Boolean]"
Object.prototype.toString.call("");           // => "[object String]"
Object.prototype.toString.call([]);           // => "[object Array]"
Object.prototype.toString.call(function(){}); // => "[object Function]"
Object.prototype.toString.call(new Error());  // => "[object Error]"
Object.prototype.toString.call(/\d+/);        // => "[object RegExp]"
Object.prototype.toString.call(new Date());   // => "[object Date]"
Object.prototype.toString.call(new class {}); // => "[object Object]"
```
#### 十六、写出Array.prototype.map方法的polyfill代码。

```javascript
if (!Array.prototype.map) {
    Array.prototype.map = function(callback) {
        if (this == null) {
            throw new TypeError('this is null or not defined');
        }
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }

        var O = Object(this);
        var len = O.length >>> 0;
        var A = new Array(len);
        var k = 0;
        var T;

        if (arguments.length > 1) {
            T = arguments[1];
        }

        while(k < len) {
            if (k in O) {
                var v = O[k];
                var rv = callback.call(T, v, k, O);
                A[k] = rv;
            }
            k ++;
        }

        return A;
    }
}
```

#### 十七、JavaScript中获取两个数(a, b]之间的随机数。

```javascript
// (0, 1], 得到一个大于等于0，小于1之间的随机数
Math.random();

// (a, b], 得到一个两数之间的随机数
Math.random() * (b - a) + a;

// (a, b], 得到一个两数之间的随机整数
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //不含最大值，含最小值
}

// [a, b], 得到一个两数之间的随机整数
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //含最大值，含最小值 
}
```



