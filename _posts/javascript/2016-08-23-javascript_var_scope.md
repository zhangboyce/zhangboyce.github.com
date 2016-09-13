---
categories: javascript
layout: post
title: JavaScript-变量作用域问题
---

#### 一、 ES6之前，函数是唯一提供局部变量作用域的地方
在ES6之前，Js不支持块级作用域，这意味着在if语句、switch语句、for循环、while循环中无法支持块级作用域。
{% highlight javascript %}
function outer() {
    var o = 'outer';
    console.log(o); // outer
    if (true) {
        var _if = 'inner if';
    }
    console.log(_if); // inner if
}
outer();
{% endhighlight %}

#### 二、 ES6之后，可用let关键字提供块级变量作用域
ES6之后，可以通过let关键字来定义变量，它修正了var关键字的缺点，支持块级作用域。
{% highlight javascript %}
function outer() {
    if (true) {
        let _if = 'inner if';
        console.log(_if); // inner if
    }
    console.log(_if); // _if is not defined
}
outer();
{% endhighlight %}

#### 三、 子级作用域可以访问父级作用域的变量（全局作用域是顶层父级）
{% highlight javascript %}
function outer() {
    var o = 'outer';
    function inner() {
        var i = 'inner';
        console.log(o); // outer
        console.log(i); // inner
    }
}
outer();
{% endhighlight %}

#### 四、 同级作用域之间不能相互访问作用域变量
{% highlight javascript %}
function outer() {
    function inner1() {
        var i = 'inner';
    }
    function inner2() {
        console.log(i); // i is not defined
    }
}
outer();
{% endhighlight %}

#### 五、 父级作用域不可以访问子级作用域的变量
{% highlight javascript %}
function outer() {
    function inner() {
        var i = 'inner';
    }
    console.log(i); //i is not defined
}
outer();
{% endhighlight %}

通过以上几点我们可以知道Js的提供的作用域是一个作用域链，简单来讲就是： 

> 某作用域内，只能访问该作用域内提供的局部变量和该作用域的父级作用域能访问的变量。






