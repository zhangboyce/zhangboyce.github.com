---
categories: programming
layout: post
title: 让你迷惑的Groovy代码
---

Groovy是一种运行在JVM平台的动态强类型语言，并且兼容Java语法，也就是说你可以在Groovy代码
中任意写Java代码，这种兼容性给初学者带来的是好处还是坏处个人觉得值得商榷，这种兼容性导致的
最直接的后果就是大多数人写的Groovy代码都是四不像。既没有很好运用Groovy代码的元编程特性，也
失去了Java语言的严谨性和结构性。 
<!-- more -->   

实际上，Groovy代码最终也会和Java一样先预编译成.class二进制文件，也就是说如果我们反编译Groovy
编译而成的.class文件，可以全部翻译成Java代码。

#### 一、一段诡异代码的迷惑性

正式因为Groovy和Java这种暧昧不清的关系，导致我们在写Groovy代码的时候经常会遇到一些迷惑的概念。
先看一段Groovy官网的代码：
{% highlight groovy %}
int method(String arg) {
    return 1;
}
int method(Object arg) {
    return 2;
}
Object o = "Object";
int result = method(o);

//java
assertEquals(2, result);

//groovy
assertEquals(1, result);
{% endhighlight %}
下面是官网对这段代码的说明：

> That is because Java will use the static information type, which is that o 
> is declared as an Object, whereas Groovy will choose at runtime, when the 
> method is actually called. Since it is called with a String, then the String 
> version is called.

我们发现同样的代码分别在Java和Groovy环境下编译，最终运行的结果是不相同的。   

这段代码的诡异性并在它的运行结果不相同，而是由于这个不同容易让我们产生一种误解： 
好像Groovy在声明变量的时候类型不重要，在运行的时候Groovy才会去根据实际的变量类型去查找相应的方法。
比如上面的o变量，貌似在Groovy中下面三种声明方式一样：
{% highlight groovy %}
Object o = "Object"
String o = "Object"
def o = "Object"
{% endhighlight %}   
的确在上面的代码中，这三种声明方式都会调用第一个方法。那么是不是可以说Groovy在声明变量的时候类型不重要，
在运行的时候Groovy才会去根据实际的变量类型去查找相应的方法呢？Groovy是不是弱类型语言呢？

#### 二、从Java编程的一个重要设计原则谈起

曾经有一段时间，设计模式被视为Java编程的葵花宝典，貌似作为一个Java程序员，如果不知道一两个经典
的设计模式都不好意思写代码。设计模式中的很多思维方式确实很经典，把Java语言的特性发挥到了极致，
但是也有很多人诟病设计模式，认为很多设计模式是把简单的问题变复杂了。今天我们不讨论设计模式。只
看看Java的一个重要的设计原则： 里氏替换原则。    

什么是里氏替换原则？简单一句话就是：在父类出现的地方子类都可以出现，而且替换后保证程序不会
出现任何乱子。反过来不一定成立。   

要想遵守里氏替换原则，其中有重要的一条就是：    
<b>覆盖或实现父类方法的时候方法参数可以被放大，但是不能被缩小。</b>看一个例子：
{% highlight java %}
public class Father {
    public void _do(HashMap map) {
        //_do f
    }
}

public class Son extends Father {
    //放大输入参数类型
    public void _do(Map map) {
        //_do s
    }
}
{% endhighlight %} 
实际上我们知道这个时候子类并不是Override父类方法，而是Overload父类方法，相当于此时子类拥有
两个同名方法，而且同名方法的参数类型是父子关系。    

下面的代码，将Father完全替换为Son，调用的方法都是 //_do f，不会引起任何业务以及逻辑乱子。
{% highlight java %}
Father f = new Father();
HashMap map = new HashMap();
f._do(map);

Son s = new Son();
HashMap map = new HashMap();
s._do(map);
{% endhighlight %}

再来看看下面的方式：
{% highlight java %}
Father f = new Father();
Map map = new HashMap();
f._do(map);
{% endhighlight %}

我们会发现编译不通过，因为Father类没有参数为Map的_do方法。我们只能这样做：
{% highlight java %}
Father f = new Father();
Map map = new HashMap();
f._do((HashMap)map);
{% endhighlight %}

这个例子和我们前面的例子是一样的：    
<b>一个类拥有两个Overload的同名方法，方法参数是父子类关系。</b>在Java中，如果我们用父类型
声明了参数，想要调用子类型的方法，如上我们声明的时候是父类型（Map），想要调用子类型的方法_do(HashMap)，
就必须进行向下强制转型。那在Groovy中呢？

#### 三、揭开其神秘的面纱

在第一章节由于被代码迷惑了，我们提出了一个幼稚的猜想：是不是可以说Groovy在声明变量的时候类型不重要，
在运行的时候Groovy才会去根据实际的变量类型去查找相应的方法呢？Groovy是不是弱类型语言呢？    

当然不是：
{% highlight groovy %}
int i = "123"
{% endhighlight %}
运行时就报错了，Cannot cast object '123' with class 'java.lang.String' to class 'int',
说明Groovy是强类型，只是它是动态的，在运行期间才做数据检查。而且注意，我们从错误信息可以看出，
Groovy在运行期间做数据检查的时候是试图将真实的变量 "123" cast 成我们声明的数据类型 int。    

我们替换一下第一章中方法的参数：
{% highlight groovy %}
int method(Father arg) {
    return 1;
}
int method(Son arg) {
    return 2;
}
Father o = new Son();
println(method(o)) //2
{% endhighlight %}

同样我们将第二章中的例子在Groovy环境下编译运行：
{% highlight groovy %}
Father f = new Father();
Map map = new HashMap();
f._do(map); //_do f
{% endhighlight %}
为什么？Father类并没有参数为Map类型的_do方法。    

种种迹象表明：<b>Groovy在调用Overload方法的时候，如果Overload的方法参数存在父子关系，我们
声明参数变量如果使用父类型引用，Groovy会实现向下强制转型，调用子类型参数的方法。</b>   

#### 四、为什么要默认向下强制转型？

我觉得Groovy实现默认向下强制转型的一个原因是为了支持它的def语法。在Groovy中，声明变量的时候
可以不写类型，用def声明：
{% highlight groovy %}
def s = "abc"
def i = 123
def u = new User()
{% endhighlight %}
表面上Groovy可以不指定变量类型，类型是根据具体的变量值决定的，实际上不是。
实际上用def关键字声明变量想当于：
{% highlight groovy %}
Object s = "abc"
Object i = 123
Object u = new User()
{% endhighlight %}
实际上def声明的所有的变量类型都是Object类型，因为Object类是一切类的父类，在使用的时候才会
对这些Object类强制向下转型成相应的类型。很难想象Groovy如果不支持向下强制转型。         

当然，如果变量之间不存在父子关系，是不会强制向下转型的。
{% highlight groovy %}
int method(int arg) {
    return 1;
}
int method(String arg) {
    return 2;
}
String o = 123
println(method(o)) //2
{% endhighlight %}
虽然我们的实际变量值 123 实际上是int类型，但是在运行期间做数据检查的时候会将int toString为
String 的 "123"。String 与 int 类型之间不存在父子关系，不会强制向下转型。    

Groovy的这些特性当然都归功于它的动态性，也可以说是这种强制向下转型支持了Groovy的动态性。











