---
categories: javascript
layout: post
title: JavaScript-值与对象
---

众所周知，JavaScript语言是随着Web时代的兴起而产生的，最开始是专门为了浏览器端而设计，现在随着Node的兴起，JavaScript语言开始在服务器端大展拳脚。JavaScript设计的时候Java面向对象的思想正风靡整个互联网，以至于JavaScript的名字都要起的感觉和Java有半毛钱关系似得，在这种面向对象的思想的影响下，JavaScript也被设计成一门面向对象的语言，乃至更加“面向对象”。

#### 一、在JavaScript中，一切都是值
在程序语言的世界里，什么是值？值就是数据。
 
> 程序语言都可以被看作是数据加结构的组合，结构是逻辑、是运算、是程序的框架、是不变的部分；数据是值、是变化的部分。
> 当然很多时候结构和数据是相对的。

举例说明，在Java中，Class就是结构，Class的实例就是值，实例的方法就是结构，方法的参数，局部变量等就是值。只有值才能被方法返回，才能被当做参数，才能被赋予给其他变量，赋值赋值就是这个意思。    

那么，在JavaScript的世界里面，一切都是值是什么意思？就是一切的东西都可以被当做值赋给其他变量，当做方法参数，当做方法返回值，包括方法本身。

{% highlight javascript %}
let n = 1;
let s = "String";
let b = true;
let o = {obj: 'Object'};
let f = function() {};

let a = [1, 2, 3];
let r = /.*/gi;
{% endhighlight %}

那么在JavaScript里面是不是就没有结构了？当然不是，在JavaScript中有且仅有一个结构，那就是function，所以说function既是值也是结构，所以在JavaScript中结构也可以被当做参数，返回值，赋值给其他变量。正是因为JavaScript这一神奇的特性，才会让这门语言产生很多灵活的、强大的特性。

{% highlight javascript %}
// structure is a value
let f = function() {
    console.log('i am a structure');
};

let o = {
    name: 'boyce',
    // structure is a object field
    say: function() {
        cosole.log(this.name);
    }
};

// structure is a structure
function count() {
    let i = 0;
    // structure is a returned value
    return function() {
        return i++;
    };
}
{% endhighlight %}

#### 二、除了undefined和null之外，所有的值都是由function构造的
在JavaScript里面，由语言本身定义的7种基本类型的值：

> number、string、boolean、object、function、undefined和null（由于undefined和null比较特殊，以下所说的基本类型默认不包括这俩货）。

基本类型可以理解为值的基本单元，其他的一切类型的值都是而且只能是由基本类型组成的。JavaScript也有很多内置的对象，注意内置和基本是不一样的。    

**所有的值都是由function构建，包括基本类型。**    

每一个基本类型的值，都是由function构建，只是语言本身提供了字面量的写法。推荐用字面量写法。
{% highlight javascript %}
// number type function
function Number(value) {}
let n = new Number(0);   let n = 0; 

// string type function
function String(value) {}
let s = new String('String');  let s = "String"; 

// boolean type function
function Boolean(value) {}
let b = new Boolean(true);   let b = true; 

// object type function
function Object(value) {}
let o = new Object({});   let o = {}; 

// function type function
function Function() {}
let f = new Function('a', 'b', 'return a + b'); 
let f = function(a, b) {
    return a + b;
};
{% endhighlight %}

除了以上的基本类型之外，不管是内置的还是自定义的对象，值都是由function构建的：

{% highlight javascript %}
// 内置对象
let map = new Map();

// 自定义对象
function F() {
    this.name = 'boyce';
}
let o = new F();
{% endhighlight %}

那么在JavaScript中既然没有Class的概念，那么new是什么意思呢，new其实就是调用这个方法并返回一个object，比普通的调用多做了一些事情。    

#### 三、new的方式调用function和直接调用的区别
任何的function都可以通过new的方式调用，也可以直接调用，先看直接调用的方式：
{% highlight javascript %}
function F() {
    console.log('i be executed.');
    this.name = 'boyce';
    return 'boyce';
}
let r = F(); // i be executed. r is boyce. 
{% endhighlight %}
以上是直接调用的方式，只是如果在node里面，这段代码会报错，因为this是undefined，不过在浏览器里面，代码会正常运行，this是window对象，所以执行完了之后 window.name === 'boyce'. 直接调用的方式比较简单，不在累述。

{% highlight javascript %}
function F() {
    console.log('i be executed.');
    this.name = 'boyce';
    return 'boyce';
}
let r = new F(); // i be executed. r is a object.  r.name === 'boyce'
{% endhighlight %}
我们发现new方式修改了function本身的返回值，返回了一个object，且把name这个属性以及值赋值给了这个object。以上我们大概知道了new方式调用一个function所做的事情：
1. 创建一个object，并且把this指向该object。
2. 将该object返回。
3. 当然还有一些prototype的处理逻辑不在本章讨论范围。
简单来说，大约做了这样的事情(原型暂不考虑)：
{% highlight javascript %}
// fun 就是声明的函数 F
function _new(f) {
    let o = {};
    let args = Array.prototype.slice.call(arguments, 1);

    // execute the function,  o is 'this'
    f.apply(o, args);
    return o;
}
{% endhighlight %}
那么问题来了，既然如此，为什么JavaScript里面所有值都需要由function产生呢？为什么所有的值都需要用new的方式调用一个function，然后返回一个对象？为什么不直接通过JavaScript的字面量的方式直接创建对象呢？
{% highlight javascript %}
function F() {
    this.name = 'boyce';
}
let o1 = new F();
let o2 = {
    name: 'boyce';
};
{% endhighlight %}
这个问题就涉及到另一个在JavaScript里面比较难理解的话题：[原型与继承](javascript/2016/09/07/javascript_prototype/)。




