---
categories: javascript
layout: post
title: JavaScript-Object property's properties
---

我们知道在Js语言中，定义了7中基本类型的数据，number、string、boolean、object、function和undefined，每一种数据类型的值都是有function构建而来，而function本身呢也是一种数据，是由Function function构建而来。这样呢就形成了语言的逻辑自洽。    

这篇文章主要讨论object的数据类型，object类型的数据都是有Object function构建而来，是Js中主要的数据类型之一。

Js的object数据令人着迷的地方就是它非常的灵活易用，你可以很简单的定义一个object，然后添加property，修改property，甚至删除property。

{% highlight javascript %}
let obj = {name: 'boyce'};
obj.age = 18;
obj.say = function() {
    console.log(this.name + ' is ' + this.age);
};
obj.say(); // boyce is 18
obj.name = 'everybody';
obj.say(); // everybody is 18
delete obj.age;
obj.say(); // everybody is undefined
{% endhighlight %}

Js也提供了一些方法很方便的访问object的属性名字。

{% highlight javascript %}
let obj = {
    name: 'boyce',
    age: 18,
    say: function() {
        console.log(this.name + ' is ' + this.age);
    },
    __proto__: {
        p_name: 'p_name'
    }
};

Object.keys(obj); // [ 'name', 'age', 'say' ]
Object.getOwnPropertyNames(obj); // [ 'name', 'age', 'say' ]
for (let attr in obj)  // 'name', 'age', 'say' , 'p_name'
{% endhighlight %}

既然提供了这个多访问的方式，那每一种方式肯定时候差别的。    
Object.keys() 只能访问own property，并且这个property必须是enumerable的；    
Object.getOwnPropertyNames(obj)也只能访问own property，但是呢可以访问unenumerable的；    
for ... in ... 的方式，能访问所有原型链里面的属性，只要这些属性是enumerable的。   

什么是own property也很好理解，就是定义在自己的属性列表里面的，不需要去下一级原型链查找的属性。

{% highlight javascript %}
let obj = {
    name: 'boyce', // own property
    __proto__: {
        p_name: 'p_name' // not own property
    }
};
{% endhighlight %}

那么什么是 enumerable property呢？一般情况下，我们自己通过字面量的方式为object添加的每一个property都是enumerable property，
Js也提供了怎么定义一个unenumerable property的方法。

{% highlight javascript %}
let obj = {
    name: 'boyce', // enumerable property
};
obj.age = 18; // enumerable property

Object.defineProperty(obj, 'say', {enumerable: false}); // unenumerable property
{% endhighlight %}

关于Object.defineProperty 详细API说明可以看[参考文档](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)。   

总的来讲呢，就是Js的object property是非常灵活的能被遍历，访问的。Js也提供了好用的API方便设置property的属性。








