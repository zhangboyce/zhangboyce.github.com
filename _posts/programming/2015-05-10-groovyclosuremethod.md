---
layout: post
title: Groovy中，闭包还是方法？
---

在很多语言中都有闭包这个概念，而且每种语言中对闭包的定义貌似还不怎么一样。
我第一次接触闭包的概念是在javascript语言中，而第一次正在觉得把闭包定义
得非常准确形象的是在接触ruby之后，在ruby语言中，是这样定义闭包的：  
<!-- more -->  

> 在定义一个代码块时，会获取当前的局部绑定，然后把块连同绑定传递给一个方法，
> 在定义一个代码块时，会获取当前的局部绑定，然后把块连同绑定传递给一个方法，
> 此时，方法中的局部变量对块来说是不可见的。基于块这样的封闭的特性，计算机
> 科学家喜欢把这样的代码块称为闭包。

#### 一、从Javascript和ruby看闭包是什么？
*  在Javascript中，function是第一对象，一个闭包就是一个满足某些要求的function。
比如以下代码，setup function中返回一个function，该function访问了setup function 
的局部变量，并连同function一起被返回。
{% highlight javascript %}
var  setup = function() {
    //函数setup的私有变量
    var count = 0;
    //返回函数访问私有变量
    return function() {
        return (count += 1);
    };
};
{% endhighlight %}

<b>这种方法可以将setup function的局部变量带到它的作用域之外。</b>

* 在ruby中，代码块作为“可调用对象”，被用来实现闭包的功能。在ruby中，只有在调用
一个方法的时候才能定义块，块会直接传递给这个方法，在方法中用yield关键字调用该块。
可以看出，与javascript中不同的是，在ruby中闭包不是作为方法的返回值出现，而是作为
方法的参数出现的。
{% highlight ruby %}
def my_method
    x = "i am in method"
    yield("i am a argument from method to closure")
end
x = "i am out method"
my_method {|y| #{x}, #{y}}
//i am out method, i am a argument from method to closure
{% endhighlight %}

<b>可以看出，ruby中的闭包可以将当前定义处的变量值绑定并一起带到方法内部，而且
在方法内部，闭包是一个完全封闭的，对方法内的变量是不可见的。</b>    
在ruby中，闭包也是用来将某个作用域的值绑定带到另一个作用域。ruby中的扁平作用域，共享
作用域等都是依靠闭包实现的。

#### 二、如此说来，Java中也有闭包？
从javascript和ruby的闭包定义中，我们至少可以简单的总结一下闭包大概需要满足什么条件。    

* 闭包应该是一个“可调用对象”，无论是javascript中的返回function，还是ruby中作为参数
的代码块，都是一个“可调用对象”。
* 闭包有封闭的作用域。在闭包定义的时候，能够获取绑定当前域的变量。并随着闭包被返回或者
被作为参数传递给一个方法，闭包将携带一个域的变量到另一个域，且变量在闭包内封闭。

在Java中，唯一的“可调用对象”就是对象，也只有对象才能作为返回或者方法参数被传递。在对象被
实例化的时候能够获取当前环境的变量，并且能将这些变量带到其他作用域中。Java所有的类之间
的协作以及Java的面向对象的特点也正在于此：类就是闭包。

#### 三、Groovy中所谓的闭包
Groovy中所谓的闭包是什么。首先来看一下Groovy中所谓的闭包语法：
{% highlight groovy %}
{ item++ }                                                                        

{ String x, int y ->                                
    println "hey ${x} the value is ${y}"
}

def closure = { reader ->                                         
    def line = reader.readLine()
    line.trim()
}
{% endhighlight %}
在Groovy中，闭包的概念更加的宽泛，不像javascript那样必须是返回函数，也不像ruby那样只能作为
方法参数。在Groovy中，只要是一个代码块就可以叫做闭包，可以作为方法参数，可以作为返回值，
可以单独被调用。为什么Groovy中的闭包这么牛逼？来看Groovy官网的一段闭包的描述：

> A closure is an instance of the groovy.lang.Closure class, 
> making it assignable to a variable or a field as any other variable, 
> despite being a block of code:

{% highlight groovy %}
def listener = { e -> println "Clicked on $e.source" }      
assert listener instanceof Closure

Closure callback = { println 'Done!' }                      
Closure<Boolean> isTextFile = {
    File it -> it.name.endsWith('.txt')                     
}
{% endhighlight %}
所以，在Groovy中，闭包就是类Closure，定义一个闭包就是定义一个Closure类。我们知道，在Java中
其实类就可以看成是闭包。因此我们也可以说Groovy中其实没有闭包，Groovy所谓的闭包只不过是提供一种
简便的语法支持来构建简单的类。   

#### 四、方法还是闭包？——Groovy
当然，Groovy中的这种闭包写起来还是很便利，但是我们在使用Groovy的时候，往往会面临一个问题，
这个地方是用一个方法还是用一个闭包？
{% highlight groovy %}
def method(def arg1, def arg2) {
    println("method: $arg1 + $arg2")
}

def closure = {def arg1, def arg2 ->
    println("closure: $arg1 + $arg2")
}
{% endhighlight %}
为了回答这个问题其实也很简单，只要清楚Groovy中闭包的本质是一个类就可以，在Groovy或Java
中，类是唯一的“可调用对象”，唯一可以作为参数和返回值的对象。所以，使用Groovy的时候只有在
一种情况下建议使用闭包，就是在Java中这个地方你不得不使用类但是又觉得使用类有点多余的时候，
或者你在不得不使用匿名内部类的时候，就使用Groovy提供的便利构建类的方式——闭包。其他情况，
用方法。    

所以在一个类中，把一个方法定义成闭包，但是这个闭包不作为方法参数，也不作为方法返回值时，我觉得
是没有任何意义的，除了语法上让别人觉得你懂点Groovy之外。

#### 五、Groovy中的闭包似乎可以是这个样子
单从语法上讲，我们想象中的Groovy闭包是不是应该更像这个样子？
{% highlight groovy %}
def methodReturnClosure(def arg) {
    int i= 0
    return {
        println "$arg + ${i++}"
    }
}

def closureReturnClosure = { def arg ->
    int i = 0
    return {
        println "$arg + ${i++}"
    }
}

def closure = test.methodReturnClosure("methodReturnClosure")
closure.call()

closure = test.closureReturnClosure("closureReturnClosure")
closure.call()
{% endhighlight %}
但是，似乎我们很少会这样使用，这不是javascript中的标准的闭包定义么？因为
在Groovy或者Java中，这种情况我们都使用类代替了，当然也可以这么做，只是一种便利
的语法支持，和使用类没有任何本质区别。


