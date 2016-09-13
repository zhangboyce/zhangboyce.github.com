---
categories: javascript
layout: post
title: JavaScript-三句箴言
---

由于Js的灵活以及它和其他面向对象语言设计方式的差异，导致用一般面向对象语言的方式很难理解它，这篇文章就从三句话来了解Js。我称之为“3E箴言”。  

>  Everything is a value    
>  Every value is built by function    
>  Every function has a prototype property


#### 一、Everything is a value
在Js的世界里面，一切都是值。为什么这个很重要，我觉得这是Js区别于像Java这样的面向对象语言的最根本的因素。    

在Java中，就不是一切都是值，特别是有两个重要的元素它们不是值，一个是Class，一个是method。    
Class提供的是一个实例的构造蓝图，一个Class的实例是完全按照这个Class绘制的蓝图构造出来的，不容有误。Class不是值，所以Class不能作为method参数，不能作为method返回值，不能赋予给其他的变量。    

但是在Js中，没有Class的概念，没有蓝图。只有function，而且function是一个值。我们知道function是唯一构造对象的，可以看做是一个class（当然和class有本质的区别），也是一个method。所以在Js中，可以看做为“class”和method都是值，这就造就了Js极其灵活的基因。   

当然了，除了function之外，其他一切数据也都是值。[详情参见](/javascript/2016/09/08/javascript_value/)

#### 二、Every value is built by function
在Js语言中，所有的值都是有function构建而来，这一点非常重要。这是保证了这么灵活的语言不至于紊乱的重要因素。虽然Js提供了诸多的字面量的方式创建value，但是本质上这些字面量的背后也都是由function构建而来的。 

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

让所有的值都是有function构建而来有显而易见的好处，就是对所有的值方便管理，比如都能继承Object，比如都有统一的某些属性。

#### 三、Every function has a prototype property
在Js中，所有的function都有一个prototype属性，这是Js实现继承的标准所在。我们知道所有的值都是由function构建而来，所以在通过new关键字创建值得时候，创建出来的值的__proto__都指向了该function的prototype属性，这就构成了Js的原型链。    

我们知道，function本身也有值，function是由名字叫Function的function构建而来的。所以所有function的__proto__都指向Function.prototype，我们又知道，Object是一个function，Number是一个function... 当然，Function本身也是一个function。

{% highlight javascript %}
Object.__proto__ ==== Function.prototype; 
Object instanceof Function;

Number.__proto__ ==== Function.prototype; 
Number instanceof Function;

Function.__proto__ ==== Function.prototype; 
Function instanceof Function;

{% endhighlight %}

所以，我们可以这样给一些function添加方法。

{% highlight javascript %}
Function.prototype.method = function(funcName, func) {
    if (!this.prototype[funcName]) {
        this.prototype[funcName] = func;
    }
};
// 给所有的function添加xxoo的方法
Function.method('xooo', function() {
    console.log('wow!');
});
var xxoo = function() {};
xxoo.xooo();

// 给所有string添加trim方法
String.method('_trim_', function() {
    return this.replace(/^\s+|\s$/g, '');
});
'   xxoo   '._trim_() === 'xxoo';
{% endhighlight %}

认识Js的原型链是认识Js语言设计哲学的关键。    
这篇文章算是简单的对之前关于Js的所有文章的总结，也是对Js语言的设计原理做一个简单的总结。    

1. [JavaScript-prototype 到底是个什么鬼](/javascript/2016/09/07/javascript_prototype/)     
2. [JavaScript-值与对象](/javascript/2016/09/08/javascript_value/)     
3. [JavaScript-难道这都算继承？](/javascript/2016/09/09/javascript_inherit/)     
4. [JavaScript-Object property's properties](/javascript/2016/09/12/javascript_object_property/)     

-








