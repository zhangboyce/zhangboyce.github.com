---
categories: javascript
layout: post
title: JavaScript-难道这都算继承？
---

网上充斥着各种关于Js的继承的文章，一看标题大约都是“Js继承的5种方式、8种办法”，当然总结得也很好，只是有些地方个人觉得有凑数的嫌疑，仔细分析似乎有些牵强附会的意思。这篇文章就通过原型的角度重新讲讲到底什么才是Js的继承，如果你对Js的原型还不是很熟悉，请[移步](/javascript/2016/09/07/javascript_prototype/)。

#### 一、什么情况才算是子继承了父？
继承，在现实生活中是富二代发家致富的必备手段，在我们程序语言的世界里面同样也是程序“发家致富”的手段。顾名思义，继承就是“把你的东西给我”，当然不能白给你，除非你是人家儿子，或者你认人家当干爹，总之，就是继承了之后你和被继承者之间有一定的继承关系。    

这种继承关系在Js语言中怎么判断？怎么才知道我是不是继承的你？讨论这个之前，先了解一个关键字：**instanceof**。    

> instanceof用来判断某个function的prototype属性是否存在于另外一个对象的原型链上。

什么意思？某个function的prototype属性存在另外一个对象的原型链上意味着什么？通过[这篇讨论](/javascript/2016/09/08/javascript_value/)我们知道，在Js中，所有的值都是由function构建而来，再通过[这篇讨论](/javascript/2016/09/07/javascript_prototype/)我们又知道，function的prototype属性是提供给由它所构建的值的__proto__属性引用的。    

**也就是说，某个function的prototype属性，一定存在于由它所构建的对象的原型链上，除非手动修改**

{% highlight javascript %}
function Foo() {}
let foo = new Foo();

// 可以知道
foo.__proto__ === Foo.prototype; 
// 因为Foo的prototype属性存在于foo的原型链上，所以
foo instanceof Foo  === true
{% endhighlight %}

所以说，如果某个function的prototype属性存在于另外一个对象的原型链上，我们就视为这个对象是由该function构建而来，所以该对象instanceof该function。那么回答上面的问题：继承关系在Js语言中怎么判断，或者说怎么体现？

> 一个对象如果是由子function构建而来，那么它一定也要被视为由父function构建而来，也就是说子function构建出来的对象一定也要 instanceof父function。

换言之，就是如果A继承了B，那么A的prototype属性和B的prototype都要存在于new A()对象的原型链上。

{% highlight javascript %}
function A() {this.name_a = 'name_a';}
function B() {this.name_b = 'name_b';}

let a = new A();
a.__proto__ === A.prototype;
a instance A === true;
{% endhighlight %}

这是毋庸质疑的，是由Js语言的new关键字从语言层面实现的，因为a.__proto__只能引用一个值，所以要想B.prototype存在于a的原型链上，只能是通过A.prototype.__proto__属性往下接。

{% highlight javascript %}
A.prototype.__proto__ = B.prototype;
a instance A === true;
a instance B === true; // 哇哦！

// 但是
a.name_a === 'name_a';
a.name_b === undefined; 
{% endhighlight %}
捋一下，因为name_b属性在a自己的属性列表里面没有找到，    
然后会去a.\_\_proto\_\_，也就是A.prototype里面找，也没有，    
然后会去A.prototype.\_\_proto\_
\_，也就是B.prototype里面找，也没有，    
然后会去B.prototype.\_\_proto\_\_，也就是Object.prototype里面找，也没有，    
然后会去Object.prototype.\_\_proto\_\_里面找，然而发现Object.prototype.\_\_proto\_\_是null，所以最终没有找到，返回undefined。  

所以以上方法虽然语法上继承了，但是没有实质的意义，a只能继承B.prototype的属性，因为虽然B.prototype在a的原型链上了，但是name_b并不在a的原型链上，注意name_b不是B的属性，而是由B构建的对象的属性。所以要想name_b在a的原型链上，就需要由B构建的对象也要在a.原型链上。

{% highlight javascript %}
let b = new B();
A.prototype.__proto__ = b;
a instance A === true;
a instance B === true;

a.name_a === 'name_a';
a.name_b === 'name_b'; 
{% endhighlight %}
因为，B.prototype在b的原型链上，b又在a的原型链上，所以B.prototype也就在a的原型链上了，这样a不仅可以继承b的属性，也可以继承B.prototype的所有属性，实现了整个Js原型继承的逻辑自洽。

也有这样做的
{% highlight javascript %}
A.prototype = b; // 而不是A.prototype.__proto__ = b，相当于原型链中删掉原有的A.prototype，直接将A.prototype替换成b，和A.prototype.__proto__ = b有一点区别

// 请看区别
function A() {
   this.name_a = 'name_a';
}
A.prototype.say = function() {
    console.log(this.name_a);
}

A.prototype = b; // say方法就没有了，所以必须将A.prototype.xxx写在这句话后面。
A.prototype.__proto__ = b; // say 方法健在，因为并没有删除A.prototype，而是把A.prototype.__proto__修改了，A.prototype.__proto__原先指向Object.prototype

{% endhighlight %}

#### 二、换汤不换药的其他写法之一详解
由于Js语言的灵活性，看似可以通过各种方式实现继承，其实本质都是一样的。

{% highlight javascript %}
function P() {
    this.name = 'p';
    this.say = function() {
        console.log(this.name);
    }
}
function C() {
    this.collage = 'collage';
    P.call(this);
}
let c = new C();
c.collage === 'collage';
c.say(); // p
{% endhighlight %}

貌似还不错，甚至有一些人看到P.call(this)这样的写法觉得很优雅，很牛逼的样子，其实就是调用P，然后把this指向C，它比new的方式调用P少做了一些事情。假如父类方法有参数呢？

{% highlight javascript %}
function P(name, age) {
    this.name = name;
    this.age = age;
    this.say = function() {
        console.log(this.name + ': ' + this.age);
    }
}
function C() {
    this.collage = 'collage';
    P.apply(this, arguments);
}
let c = new C('boyce', 18);
c.collage === 'collage';
c.say(); // p: 18
{% endhighlight %}

上面的继承方式虽然很别扭的支持了参数，之所以别扭，是因为非要把灵活的Js当作死板的Java用，或者说非要把
基于function的Js当作基于Class的Java用。当然上面的方式出了别扭还有其他更严重的问题。

{% highlight javascript %}
P.prototype.hello = function() {
    console.log('hello: ' + this.name);
}
// 第一个问题
c instanceof P === false;
// 第二个问题
c.hello(); //报错
{% endhighlight %}

其实上面两个问题是一个问题，就是P.prototype不在c的原型链中。解决方法也很简单

{% highlight javascript %}
C.prototype.__proto__ = P.prototype;

// 这里为什么不是像原型链继承一样是 = new P() 呢？而是 = P.prototype
// 那是因为 new P()的目的是为了继承P所构建对象的属性，
// 而这种方式已经通过P.apply(this, arguments); 继承了P所构建对象的属性了。

c instanceof P === true;
c.hello(); // hello boyce
{% endhighlight %}

思考
{% highlight javascript %}
C.prototype.__proto__ = P.prototype;
C.prototype = P.prototype; // 可以这么写么？
{% endhighlight %}

完整代码

{% highlight javascript %}
function P(name, age) {
    this.name = name;
    this.age = age;
    this.say = function() {
        console.log(this.name + ': ' + this.age);
    }
}
P.prototype.hello = function() {
    console.log('hello: ' + this.name);
}

function C() {
    this.collage = 'collage';
    P.apply(this, arguments);
}
C.prototype.getCollage = function() {
    return this.collage;    
}
C.prototype.__proto__ = P.prototype;

let c = new C('boyce', 18);
c instanceof C === true;
c instanceof P === true;
c.say(); // p: 18
c.hello(); // hello: boyce
c.collage === 'collage';
c.getCollage() === 'collage';
{% endhighlight %}

#### 三、object之间的分享
上面描述的都是一个function继承另一个function，实际上不是function继承，而是通过在function上做手脚，使function构建的对象之间实现继承。在function上做手脚的好处是所有由该function构建出来的对象都继承了父function的属性，当然我们也可以通过修改原型链实现object之间的属性分享。

{% highlight javascript %}
var p = {
    name: 'p', 
    hello: function() {
        console.log('hello ' + this.name);
    }
}; 
// p是Object这个function构建而来，所以p.__proto__ == Object.prototype

// 要想c继承p很简单，修改c的__proto__属性
var c = {name:'c'}; 
c.__proto__ = p;
c.hello(); // hello c

c instanceof p 
// 直接报错，因为p不是一个function，也可以理解，因为c并不是由p构建而来，而是他俩都是有Object function构建而来，应该不算是继承，更像是兄弟分享。
{% endhighlight %}

#### 四、有些事，你搞着搞着就晕了
还是那句话，由于Js语言的灵活特性，你还可以想出很多所谓实现继承的方式，比如
{% highlight javascript %}
function C() {
    let p = new P(); // 把call的调用方式换成new的调用方式
    p.other = 'other';
    return p;
}
{% endhighlight %}

再比如

{% highlight javascript %}
function C() {
    let p = new P(); 
    // 通过遍历p的所有自有属性 设置到C.prototype中
}
{% endhighlight %}

无论什么方式，都没有原型继承优雅（原型就是为了继承而生的），或者说都是原型继承的变体，归根结底就是怎么复制父类属性的问题。还有就是无论什么继承都需要处理原型链，才能实现继承的逻辑自洽。    

所以，请忽略其他乱七八糟的继承，你大概也不会真正用到它们，知道怎么回事就行。但是关于Js的原型，一定得掌握，这可以说是Js继承的本质。











