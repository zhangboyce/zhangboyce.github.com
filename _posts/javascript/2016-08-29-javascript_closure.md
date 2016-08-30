---
categories: javascript
layout: post
title: JavaScript Closure 的本质
---

关于JavaScript Closure其实就一句话可以解释：

> 在一个函数f1内部返回一个函数f2，且f2函数体内使用了f1函数体内定义的变量。

#### 一、在一个函数内部返回另一个函数的必要性探讨
在JavaScript的世界里，因为function是第一对象，所以在一个function内部可以很随意的返回另外一个function：
{% highlight javascript %}
function f1() {
    var i = 0;
    console.log('execute f1: ' + i);
    return function() {
    	var j = 0;
    	console.log('execute f2: ' + j);
    };
}
var f2 = f1(); // execute f1: 0
f2(); // execute f2: 0
{% endhighlight %}
虽然上面的代码可以完美的执行，但是细心的你可能已经发现，上面的代码完全就是脱了裤子放屁——多此一举。因为f2完全没有必要通过f1返回，完全可以用以下代码替代之：
{% highlight javascript %}
function f1() {
    var i = 0;
    console.log('execute f1: ' + i);
}
function f2() {
    var j = 0;
    console.log('execute f2: ' + j);
}
f1(); // execute f1: 0
f2(); // execute f2: 0
{% endhighlight %}

所以说，如果f2函数和f1半毛钱瓜葛都没有，是不是f2完全可以不用f1返回，我想答案是肯定的。那么f2和f1到底能产生什么样的瓜葛呢？——f2可以访问f1作用域内的变量。

#### 二、闭包是一种访问子级作用域变量的方式
关于[JavaScript 变量作用域问题](/javascript/2016/08/23/javascript_var_scope/)。同时我们知道[回调是访问同级作用域的方式](/javascript/2016/08/26/javascript_callback_function/)，那么想要访问子级作用域的变量呢？闭包是一种方式：
{% highlight javascript %}
function f1() {
    var i = 0;
    return f2() {
        i++;
        console.log(i);
    }
}
 
var f2 = f1();
f2();
f2();
{% endhighlight %}

所以闭包和回调分别是访问子级和同级作用域的方式，一个是通过将函数当做返回值，一个是通过将函数当做参数。由于JavaScript语言中函数是第一对象，所以可以实现很多奇妙的事情。









