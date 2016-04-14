---
categories: programming
layout: post
title: 诡异的Java匿名内部类写法
---

在很多时候，我们需要在类的内部初始化一个静态的Map或者List，然后保存一下常量值提供给类内部方法使用。    
我们通常的做法是：  
<!-- more -->  
首先初始化一个Map的静态变量，然后在静态块添加常量值：
{% highlight java %}
private final static Map<String, String> CONSTANT = new HashMap<String, String>();
static {
	CONSTANT.put("1", "one");
	CONSTANT.put("2", "two");
}
{% endhighlight %}

#### 一、你也许会陌生的匿名内部类写法

{% highlight java %}
private final static Map<String, String> CONSTANT =
     new HashMap<String, String>() {
	{
		put("1", "one");
		put("2", "two");
	}
};
{% endhighlight %}

#### 二、先看看我们熟悉的写法

如果对于这种方式比较陌生，那先看两个熟悉的  

* 熟悉1

{% highlight java %}
new Thread() {
    public void run() {
        System.out.println("Thread running!");
    };
}.start();
{% endhighlight %}
上面这段代码的意思就是，声明一个Thread的子类并重写Thread的run()方法，
然后创建一个该子类的实例然后调用其start()方法。    
由于声明的该Thread的子类没有名字，所以叫匿名类。    
又由于没有名字的类只能存在于一个类或者一个方法内部，所以又称为匿名内部类。    

* 熟悉2
{% highlight java %}
Thread thread = new Thread() {
    public void run() {
        System.out.println("Thread running!");
    };
};
thread.start();
{% endhighlight %}
唯一的区别就是不是直接创建子类并调用其方法，而是声明一个该子类的父类引用thread，然后通过该父类引用调用子类方法。    
创建完匿名类的实例后，没有立即执行start()，创建实例和执行实例的方法分开。    

两者的区别相当于：
{% highlight java %}
//1
new User().setName("Boyce Zhang");
//2
User user = new User();
user.setName("Boyce Zhang");
{% endhighlight %}

#### 三、那个陌生的写法究竟是个什么鬼？

我们将熟悉的写法稍加改变
{% highlight java %}
new Thread() {
    public void run() {
        System.out.println("Thread running!");
    };
    {
        start();
    }
};
{% endhighlight %}

<b>实际上这种写法就是在匿名子类的类局部代码块中调用其类方法。</b>  
<b>局部代码块内的语句是在创建该类的实例后由类加载器隐式立即执行的。</b>  

相当于：
{% highlight java %}
public class MyThread extends Thread {
    {
        start();
    }
    public void run() {
        System.out.println("Thread running!");
    };
}
{% endhighlight %}
所以三种方式在执行的时刻上略微的差别之外，效果并没有太大的区别。

这样一来，前面初始化Map的方式就不难理解了:
{% highlight java %}
private final static Map<String, String> CONSTANT = new HashMap<String, String>() {
    {
        put("1", "one");
        put("2", "two");
    }
};
{% endhighlight %}
原理就是：    
声明并实例化一个HashMap的子类（子类没有重写父类HashMap的任何方法），并且在子类的类局部代码块调用父类HashMap的put()方法。    
最后声明一个Map接口引用CONSTANT指向实例化的HashMap子类的实例。    
根据前面的例子我们知道，类局部代码块中的put()方法调用将在HashMap的匿名子类被实例化后由类加载器隐式的执行。    

#### 四、举一反三

其实,对于Java的任何类或接口，都可以声明一个匿名类继承或实现它。如：    
{% highlight java %}
//重写父类方法，局部代码块调用自己重写过的父类方法。
List<String> list = new ArrayList<String>() {
    public boolean add(String e) {
        System.out.println("Cannot add anything!");
    }

    //代码块的顺序在前后都无所谓，可以出现在类范围的任何位置。
    {
        add("Boyce Zhang");
    }
};

//局部代码块调用父类方法。
dao.add(new User(){
    {
        setName("Boyce Zhang");
        setAge(26);
    }
});

//重写父类方法
ThreadLocal<User> threadLocal = new ThreadLocal<User>() {
    protected String initialValue() {
        return new User("Boyce Zhang", 26);
    }
};
{% endhighlight %}
<b>在匿名类的内部我们不但可以实现或重写其父类的方法。    
而且也可以在其类的局部代码块中执行自己的方法或者其父类的方法。    
这并不是匿名内部类的特殊语法，而是Java的语法，对于任何类都适用。</b>    

#### 五、这种写法的优缺点分析

这种写法常常就是用在实例化一个类后立即执行某些方法做一些类实例的数据初始化什么的。    
其作用和先实例化一个类，在使用其引用调用需要立即调用的方法是一样的，如：    
{% highlight java %}
Map<String, String> map = new HashMap<String, String>();
map.put("1", "one");
map.put("2", "two");
{% endhighlight %}
这种语法的优点就是简单，实例化一个类后立即做一些事情，比较方便。    
效果有一点儿像Javascript里的即时函数一样。但是有本质的区别。    
因为Javascript没有类的概念，或者说Javascript中function就是类，类就是function，    
所以即时函数是加载完后执行整个function。而Java的局部代码块是可以选择执行类的任何方法。

当然这种写法也有其缺点：    
每一个内部类的实例都会隐性的持有一个指向外部类的引用（静态内部类除外），    
这样一方面是多余的引用浪费，另一方面当串行化这个子类实例时外部类也会被不知不觉的串行化，
如果外部类没有实现serialize接口时，就会报错。