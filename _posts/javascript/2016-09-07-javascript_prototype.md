---
categories: javascript
layout: post
title: JavaScript-prototype 到底是个什么鬼
---

在展开Js的prototype讨论之前，一定要首先弄清楚的几件事情。

#### 一、 prototype是用来干嘛的？
我们知道Js最初设计是为了在浏览器端处理一些简单的事情，作者估计也没想把这门语言搞得太复杂，虽然当时面向对象的潮流很是火爆，作者还是没有搞得像Java一样复杂的面向对象。要想搞清楚prototype是搞啥的，最简单的方式是假设如果没有prototype。

{% highlight javascript %}
let o1 = {
    name: 'o1',
    say: function() {
        console.log(this.name);     
    }
};
let o2 = {
    name: 'o2',
    say: function() {
        console.log(this.name);     
    }
};
{% endhighlight %}
我们发现 o1和o2 的say方法都是一样的，只是name不一样而已，那么这个say方法是不是可以被重用呢？当然可以，而且代码重用的方式也有很多，组合、继承，甚至再创建一个function也是重用代码的方式。那么对于Js语言的作者来讲，要不要设计语言的继承来重用代码就成了一个问题，因为Js没有Java一样Class的概念，不能继承父类的Class这种概念。   
**prototype就是为了解决继承问题而产生的。**

#### 二、 prototype是怎么解决继承问题的？
简单来讲就是每一个对象都有一个__proto__引用，指向自己继承的对象，被继承的对象也是一个对象，所以内部也有一个__proto__引用，指向它继承的对象，以此类推。
如果一个成员在自己的属性列表里面没有被找到，就会跑到自己的__proto__引用的对象里面找，如果在这个对象里面也没有找到，就会继续在它的__proto__引用的对象里面去找，以此类推。什么时候算找到头了，一就是找到了就返回，二就是发现某个对象的__proto__对象是null了就找到头了，而这个头对象就是Object。
prototype链找寻的方式大概是：
{% highlight javascript %}
function getProperty(obj, prop) {
    if (obj.hasOwnProperty(prop)) //首先查找自身属性,如果有则直接返回
        return obj[prop]
    else if (obj.__proto__ !== null)
        return getProperty(obj.__proto__, prop) //如何不是私有属性,就在原型链上一步步向上查找,直到找到,如果找不到就返回undefind
    else
        return undefined
}
{% endhighlight %}
验证一下：
{% highlight javascript %}
let o = {
    say: function() {
        console.log(this.name);     
    }
};
let o1 = { name: 'o1', __proto__: o };
let o2 = { name: 'o2', __proto__: o };
o1.say(); // o1
o2.say(); // o2
{% endhighlight %}
其实__proto__属性一开始不是Js标准定义的，只是为了方便，很多浏览器自己支持这个属性，Js一开始要想获取自己所继承的对象是通过Object.getPrototypeOf(obj)获取obj所继承的对象的，不过Js的ES6开始也开始官方支持__proto__属性了。

#### 三、对象的prototype属性和__proto__属性有什么关系？
实际上，没有什么关系，如果非要扯上一点儿关系，就是都是为了解决继承所定义的属性。我们知道一个对象，你想要继承其他对象，就需要将_proto__引用该对象，但是一个对象也可以被其他对象所继承，所以一般情况下（也可以说Js就这样设计），一个对象可以把自己提供给其他对象继承的东西都放到对象的prototype属性里面。      

{% highlight javascript %}
let o = {
    say: function() {
        console.log(this.name);     
    },
    prototype: {
        xxoo: 'xxoo',
        say: function() {
            console.log(this.name + this.xxoo);  
        }
    }
};
let o1 = { name: 'o1', __proto__: o.prototype };
let o2 = { name: 'o2', __proto__: o.prototype };
o1.say(); // o1xxoo
o2.say(); // o2xxoo
{% endhighlight %}
那么我们不禁要问，为什么要把提供给其他对象继承的属性存放到prototype属性里面？

#### 四、为什么要把提供给其他对象继承的属性存放到prototype属性里面？
以上栗子我们可以发现，其实我们可以把提供给其他对象继承的属性放到任何属性对象里，只要继承者将它的__proto__属性指向该属性对象就行了。prototype只是一个标准的名字而已。    

通过[JavaScript的值与对象](javascript/2016/09/08/javascript_value/) 我们知道，在Js中，所有的值都是通过function构建的，所以对于所有的function对象，都有一个prototype属性（也只有function对象才有），prototype属性里面的玩意儿就是提供给对象（由它所构建的对象）继承的。 

{% highlight javascript %}
function F(name) {
    this.name = name;
}
F.prototype.say = function() {
    console.log(this.name);
}
let f = new F();
f.say(); //boyce
{% endhighlight %}

所以应该很清楚了，new的方式调用function要做的另外一件事情就是要将所创建的对象的__proto__引用该function的prototype属性。
{% highlight javascript %}
function _new(f) {
    let o = {};
    let args = Array.prototype.slice.call(arguments, 1);
    f.apply(o, args);

    // 设置原型
    o.__proto__ = f.prototype;
    return o;
}
{% endhighlight %}

#### 五、function的归function，object的归object
a. 所有的function都是由Function构建的，所以所有的function的__proto__属性都会指向Function.prototype.
{% highlight javascript %}
function F () {}
F.__proto__ === Function.prototype;
{% endhighlight %}

b. 因为Object也是一个function，Function也是function，所以
{% highlight javascript %}
Object.__proto__ === Function.prototype;
Function.__proto__ === Function.prototype;
// 同样 
// Array.__proto__ === Function.prototype
// Number.__proto__ === Function.prototype 等。
{% endhighlight %}

c. 又因为所有的Js对象都要继承Object，所有的function都是Object所以
{% highlight javascript %}
Function.prototype.__proto__ === Object.prototype;
{% endhighlight %}

d. 因为所有的值都是由function构建，所以所有的值的__proto__属性都会指向具体的某个function的prototype.
又因为所有的Js对象都要继承Object，所以所有的function的prototype都要指向Object.prototype.
{% highlight javascript %}
function F () {}
let f = new F();
f.__proto__ === F.prototype;
F.prototype.__proto__ === Object.prototype;
{% endhighlight %}

e. 原型链的尽头
{% highlight javascript %}
Object.prototype.__proto__ === null;
{% endhighlight %}
      
**function的归function:**
{% highlight javascript %}
// 所有function.__proto__ === Function.prototype;
function.__proto__ === Function.prototype;
Function.prototype.__proto__ === Object.prototype;
Object.prototype.__proto__ === null;
{% endhighlight %}

**object的归object:**
{% highlight javascript %}
let o = {};
o.__proto__ === Object.prototype;
Object.prototype.__proto__ === null;

function F () {}
let f = new F();
f.__proto__ === F.prototype;
F.prototype.__proto__ === Object.prototype;
Object.prototype.__proto__ === null;

let s = 'string';
s.__proto__ === String.prototype; // String is a function 
String.prototype.__proto__ === Object.prototype;
Object.prototype.__proto__ === null;

//...
{% endhighlight %}

#### 六、怎么通过prototype实现function的继承？
以上所有有关原型的知识都是Js内部的继承逻辑，那我们要怎么通过prototype的特性实现function之间的继承呢？
{% highlight javascript %}
function P() {
    this.p = 'p';
}
function C() {
    this.c = 'c';
}
let o = new C();
// 怎么通过某种方式让o拥有p属性, 我们知道，o.__proto__ === C.prototype

function inherit(C, P) {
    // P里面没有p, 又因为P.__proto__ === Function.prototype，跑偏
    C.prototype.__proto__ = P; 
    
    // P.prototype里面没有p, 又因为P.prototype.__proto__ === Object.prototype，跑过头
    C.prototype.__proto__ =  P.prototype; 

    // new P()里面有p, 而且 new P().__proto__ === Object.prototype，链没断，成功！
    C.prototype.__proto__ = new P();    
}
{% endhighlight %}

至此，关于Js的原型大约就有些清楚了。








