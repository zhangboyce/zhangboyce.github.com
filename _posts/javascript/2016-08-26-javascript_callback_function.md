---
categories: javascript
layout: post
title: JavaScript callback function 的本质
---

关于JavaScript callback function其实没有什么好说的，但是看到网上大量文章还在乐此不疲的讨论，关键很多文章都没有说到本质，有的甚至把回调和异步什么的强行扯上关系，让本来就不理解回调的懵逼少年情何以堪。

#### 一、你可以这样理解回调

一言不合，先上一段Java代码：
{% highlight java %}
public void method(Obejct obj) {
    String objString = obj.toString();
}
{% endhighlight %}
我要告诉你这就是回调的本质，我想要么你会正态懵逼，要么你会把我打得正态懵逼。假设你已经认同了上面的代码就是回调，那么你不难给回调下个定义：   

> “回调就是在一个方法里面调用另外一个方法的编程方式。”

那么我们不禁要问，为什么要在一个方法里面调用另外一个方法？要想回答这个深不可测的问题，只需反问一句：要不然呢？
**要不然就把“另一个方法”的代码复制到该方法被调用的地方**。所以我们是不是可以大胆的得出一个不负责任的结论：    

**在程序语言的世界里，方法的存在是为了代码的复用，回调只是通过方法参数将要复用的代码传递给该方法加以复用的一种方式而已。**    

#### 二、JavaScript中的回调函数

在JavaScript的世界里，和Java有一点区别的地方在于：JavaScript中没有class的概念，function就是一个对象，可以被赋值给一个变量，可以被当做参数，可以被当成另一个function的返回值，function对象与JavaScript里面其他对象的唯一区别就是function对象是可以被执行的。   

因为function就是对象，所以在JavaScript里面的回调显得更加简单：    
{% highlight javascript %}
function f1(callback) {
    // do someting
    callback();
}
var callback = function() {
    console.log('I am a callback function.');	
};
f1(callback);
{% endhighlight %}

当然上面的例子都是最简单的回调方式，回调最常见的还是作为“钩子”方法，将function内部细节暴露给回调函数。

#### 三、回调函数作为“钩子”方法

被回调的函数作为函数，也可以有自己的参数，这个时候我们在函数内部调用回调函数的时候就需要给回调函数传递参数。正是这种方式将函数作用域内部的细节通过回调函数暴露到了函数作用域外部。
{% highlight javascript %}
function f1(callback) {
    // do someting
    var p1 = 1;
    var p2 = 2;
    callback(p1, p2);
}
var callback = function(p1, p2) {
    console.log(p1 + p2);	
};
f1(callback);
{% endhighlight %}

思考这样一种场景：    
一位老师正在批改试卷，并给出所有小题的得分，等所有试卷批改完毕之后再将每一份试卷的小题得分加起来算总分。这个时候老师发现他会倒腾（遍历）这批试卷两次，不行我请个学生来帮我，我改一份试卷，就把这个试卷交给这位同学，这位同学就把试卷总分加出来。这其实就是一个回调的场景。    
老师就是函数f1，学生就是回调函数callback，修改过有小题分的试卷就是参数。

#### 四、是一种访问同级或者子级作用域变量的方式


#### 五、回调函数和异步的关系
回调函数和异步编程没有什么关系。如果说非要扯上一点点关系，那就是有人会将两者混淆。







