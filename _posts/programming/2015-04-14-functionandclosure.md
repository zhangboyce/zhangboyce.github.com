---
categories: programming
layout: post
title: Javascript 中的返回函数和闭包
---

#### 在Javascript中没有类的概念，函数就是第一类对象。函数就是对象，主要的表现形式有：
<!-- more -->
* 函数可以在运行时创建，也可以在运行的过程中创建。
* 函数可以被分配给其他变量，可以将它们的引用复制给其他变量。
* 函数可以作为参数传递给其他函数，且还可以作为其他函数的返回值返回。
* 函数可以有自己的属性和方法。

<br/>
本文将重点讨论函数作为返回值的形式:
{% highlight javascript %}

var  setup = function() {
    //函数setup的私有变量
    var count = 0;
    //返回函数访问私有变量
    return function() {
        return (count += 1);
    };
};
//外部调用返回函数
var next = setup();
alert(next()); //1
alert(next()); //2
alert(next()); //3
alert(next()); //4

{% endhighlight %}


#### 通过以上代码，可以看到2个现象：
* 变量count是函数setup的私有变量，外部函数是无法直接访问的，但是我们可以通过函数setup的内部匿名函数访问。如果我们将这个内部函数返回，外部调用该函数的时候就可以间接访问函数setup的私有变量。
* 函数setup的私有变量count看起来像一个静态变量，每次调用都可以在上一次调用的基础上递增1。

<br/>
现象1：在Javascript中，函数有两个特别的特征，一是前面说过的函数就是对象，二是函数提供局部作用域。这和Java中{}提供变量作用域是有区别的。
Javascript中的作用域链访问模式：

{% highlight javascript %}
//全局作用域
var global = "global";

function outer(){
    //函数outer的作用域
    var outer_v = "outer";
    alert(global); //global，能访问全局作用域的变量
    alert(inner); //undefined，不能访问内部函数作用域的变量
    
    var inner = function(){
        //函数inner的作用域
        var inner_v = "inner";
        alert(outer_v); //outer，能访问外部函数作用域的变量
    }
}

alert(outer_v); //undefined, 不能访问oute函数作用域的变量。
{% endhighlight %}

以上代码就是为了说明Javascript语言特有的“链式作用域”结构（chain scope）。即子对象会一级一级地向上寻找所有父对象的变量。所以，父对象的所有变量，对子对象都是可见的，反之则不成立。

<br/>
现象2：为什么函数setup的私有变量count的表现好似Java中的静态变量？
{% highlight javascript %}
    var next = setup();
{% endhighlight %}

不难理解，这句话调用之后，我们创建了一个全局变量next指向了函数setup的内部函数，所以setup的内部函数将一直存在于内存中，不会被垃圾回收器回收。而内部函数的存在是依赖外部函数setup的，所以setup也会一直存在于内存中而不被销毁。所以其私有属性的值不会被重置。特别注意，Javascript中函数不是类，是第一类对象，归根结底是对象，相当于内存中存在一个不被销毁的对象，所以该对象的属性不会被改变，这和Java中的静态变量是有区别的。
可以看出，随意使用返回函数是很消耗性能的，因为这些函数对象将一直存在于内存中。
<br/>

其实以上阐述的这种返回函数的模式，就是Javascript中所谓的闭包。    
闭包的概念：    
官方”的解释是：闭包是一个拥有许多变量和绑定了这些变量的环境的表达式（通常是一个函数），因而这些变量也是该表达式的一部分。    
我的理解是，闭包就是在函数外部使用函数内部的返回函数。    
也就是说：当函数a的内部函数b被函数a外的一个变量引用的时候，就创建了一个闭包。    

闭包的作用主要就是为了保护私有变量。  
  
#### 使用闭包的注意事项：        
* 由于闭包会使得函数中的变量都被保存在内存中，内存消耗很大，所以不能滥用闭包，否则会造成网页的性能问题，在IE中可能导致内存泄露。
* 由于Javascript特殊的作用域链，闭包会在父函数外部，改变父函数内部变量的值。

