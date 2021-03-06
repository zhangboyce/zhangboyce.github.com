---
categories: programming
layout: post
title: 由浅入深分析mybatis通过动态代理实现拦截器（插件）的原理
---

最近在用mybatis做项目，需要用到mybatis的拦截器功能，就顺便把mybatis的拦截器源码大致的看了一遍，为了温故而知新，在此就按照自己的理解由浅入深的理解一下它的设计。    
和大家分享一下，不足和谬误之处欢迎交流。直接入正题。    
<!-- more -->
首先，先不管mybatis的源码是怎么设计的，先假设一下自己要做一个拦截器应该怎么做。拦截器的实现都是基于代理的设计模式设计的，简单的说就是要创造一个目标类的代理类，在代理类中执行目标类的方法并拦截执行拦截器代码。    

#### 一、利用JDK的动态代理设计一个简单的拦截器    

将被拦截的目标接口：
{% highlight java %}
public interface Target {
    public void execute();
}
{% endhighlight %}

目标接口的一个实现类：
{% highlight java %}
public class TargetImpl implements Target {
    public void execute() {
        System.out.println("Execute");
    }
}
{% endhighlight %}

利用JDK的动态代理实现拦截器：
{% highlight java %}
public class TargetProxy implements InvocationHandler {
    private Object target;
    private TargetProxy(Object target) {
        this.target = target;
    }

    //生成一个目标对象的代理对象
    public static Object bind(Object target) {
        return Proxy.newProxyInstance(target.getClass().getClassLoader(),
            target.getClass().getInterfaces(),
            new TargetProxy(target));
    }

    //在执行目标对象方法前加上自己的拦截逻辑
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("Begin");
        return method.invoke(target, args);
    }
}
{% endhighlight %}

客户端调用：
{% highlight java %}
public class Client {
    public static void main(String[] args) {
        //没有被拦截之前
        Target target = new TargetImpl();
        target.execute(); //Execute

        //拦截后
        target = (Target)TargetProxy.bind(target);
        target.execute();
        //Begin
        //Execute
    }
}
{% endhighlight %}

#### 二、分离拦截逻辑

上面的设计有几个非常明显的不足，首先说第一个，拦截逻辑被写死在代理对象中：
{% highlight java %}
public Object invoke(Object proxy, Method method,
Object[] args) throws Throwable {
    //拦截逻辑被写死在代理对象中，导致客户端无法灵活的设置自己的拦截逻辑
    System.out.println("Begin");
    return method.invoke(target, args);
}
{% endhighlight %}

我们可以将拦截逻辑封装到一个类中，客户端在调用TargetProxy的bind()方法的时候将拦截逻辑一起当成参数传入：
定义一个拦截逻辑封装的接口Interceptor，这才是真正的拦截器接口。
{% highlight java %}
public interface Interceptor {
    public void intercept();
}
{% endhighlight %}

那么我们的代理类就可以改成：
{% highlight java %}
public class TargetProxy implements InvocationHandler {

    private Object target;
    private Interceptor interceptor;

    private TargetProxy(Object target, Interceptor interceptor) {
        this.target = target;
        this.interceptor = interceptor;
    }

    //将拦截逻辑封装到拦截器中，有客户端生成目标类的代理类的时候一起传入，这样客户端就可以设置不同的拦截逻辑。
    public static Object bind(Object target, Interceptor interceptor) {
        return Proxy.newProxyInstance(target.getClass().getClassLoader(),
            target.getClass().getInterfaces(),
        new TargetProxy(target, interceptor));
    }

    public Object invoke(Object proxy, Method method,
    Object[] args) throws Throwable {
        //执行客户端定义的拦截逻辑
        interceptor.intercept();
        return method.invoke(target, args);
    }
}
{% endhighlight %}

客户端调用代码：
{% highlight java %}
//客户端可以定义各种拦截逻辑
Interceptor interceptor = new Interceptor() {
    public void intercept() {
    System.out.println("Go Go Go!!!");
    }
};
target = (Target)TargetProxy.bind(target, interceptor);
target.execute();
{% endhighlight %}

#### 三、更加灵活的拦截器

当然，很多时候我们的拦截器中需要判断当前方法需不需要拦截，或者获取当前被拦截的方法参数等。我们可以将被拦截的目标方法对象，参数信息传给拦截器。
拦截器接口改成：
{% highlight java %}
public interface Interceptor {
    public void intercept(Method method, Object[] args);
}
{% endhighlight %}
在代理类执行的时候可以将当前方法和参数传给拦截，即TargetProxy的invoke方法改为：
{% highlight java %}
public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
    interceptor.intercept(method, args);
    return method.invoke(target, args);
}
{% endhighlight %}

#### 四、封装拦截器参数

在Java设计原则中有一个叫做迪米特法则，大概的意思就是一个类对其他类知道得越少越好。其实就是减少类与类之间的耦合强度。这是从类成员的角度去思考的。  
什么叫越少越好，什么是最少？最少就是不知道。  
所以我们是不是可以这么理解，一个类所要了解的类应该越少越好呢？  
当然，这只是从类的角度去诠释了迪米特法则。  
甚至可以反过来思考，一个类被其他类了解得越少越好。  
A类只让B类了解总要强于A类让B，C，D类都去了解。

举个例子：   
我们的TargetProxy类中需要了解的类有哪些呢？    
1.  Object target 不需要了解，因为在TargetProxy中，target都被作为参数传给了别的类使用，自己不需要了解它。    
2.  Interceptor interceptor 需要了解，需要调用其intercept方法。    
3.  同样，Proxy需要了解。    
4.  Method method 参数需要了解，需要调用其invoke方法。    
同样，如果interceptor接口中需要使用intercept方法传过去Method类，那么也需要了解它。那么既然Interceptor都需要使用Method，
还不如将Method的执行也放到Interceptor中，不再让TargetProxy类对其了解。Method的执行需要target对象，所以也需要将target对象给Interceptor。
将Method，target和args封装到一个对象Invocation中，将Invocation传给Interceptor。
{% highlight java %}
public class Invocation {
    private Object target;
    private Method method;
    private Object[] args;

    public Invocation(Object target, Method method, Object[] args) {
        this.target = target;
        this.method = method;
        this.args = args;
    }

    //将自己成员变量的操作尽量放到自己内部，不需要Interceptor获得自己的成员变量再去操作它们，
    //除非这样的操作需要Interceptor的其他支持。然而这儿不需要。
    public Object proceed() throws InvocationTargetException, IllegalAccessException {
        return method.invoke(target, args);
    }

    //getter and setter
}
{% endhighlight%}

Interceptor就变成：
{% highlight java %}
public interface Interceptor {
    public Object intercept(Invocation invocation)throws Throwable ;
}
{% endhighlight%}
TargetProxy的invoke方法就变成：
{% highlight java %}
public Object invoke(Object proxy, Method method,
Object[] args) throws Throwable {
    return interceptor.intercept(new Invocation(target,
        method, args));
}
{% endhighlight%}

那么就每一个Interceptor拦截器实现都需要最后执行Invocation的proceed方法并返回。
客户端调用：
{% highlight java %}
Interceptor interceptor = new Interceptor() {
    public Object intercept(Invocation invocation)  throws Throwable {
        System.out.println("Go Go Go!!!");
        return invocation.proceed();
    }
};
{% endhighlight%}

#### 五、利用注解标注需要拦截的目标方法

好了，通过一系列调整，设计已经挺好了，不过上面的拦截器还是有一个很大的不足，
那就是拦截器会拦截目标对象的所有方法，然而这往往是不需要的，我们经常需要拦截器
拦截目标对象的指定方法。    
假设目标对象接口有多个方法：
{% highlight java %}
public interface Target {
    public void execute1();
    public void execute2();
} 
{% endhighlight%}

利用在Interceptor上加注解解决。        
首先简单的定义一个注解：
{% highlight java %}
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface MethodName {
    public String value();
}
{% endhighlight%}

在拦截器的实现类加上该注解：
{% highlight java %}
@MethodName("execute1")
public class InterceptorImpl implements Interceptor {...}
{% endhighlight%}

在TargetProxy中判断interceptor的注解，看是否实行拦截：
{% highlight java %}
public Object invoke(Object proxy, Method method,
Object[] args) throws Throwable {
    MethodName methodName = this.interceptor.getClass().getAnnotation(MethodName.class);
    if (ObjectUtils.isNull(methodName))
        throw new NullPointerException("xxxx");

    //如果注解上的方法名和该方法名一样，才拦截
    String name = methodName.value();
    if (name.equals(method.getName()))
        return interceptor.intercept(new Invocation(target,    method, args));

    return method.invoke(this.target, args);
}
{% endhighlight%}

最后客户端调用：
{% highlight java %}
Target target = new TargetImpl();
Interceptor interceptor = new InterceptorImpl();
target = (Target)TargetProxy.bind(target, interceptor);
target.execute();
{% endhighlight%}

#### 六、将绑定逻辑移到拦截器中，简化客户端调用

从客户端调用代码可以看出，客户端首先需要创建一个目标对象和拦截器，然后将拦截器和目标对象绑定并获取代理对象，最后执行代理对象的execute()方法。    
根据迪米特法则来讲，其实客户端根本不需要了解TargetProxy类。将绑定逻辑放到拦截器内部，客户端只需要和拦截器打交道就可以了。    
即拦截器接口变为：
{% highlight java %}
public interface Interceptor {
    public Object intercept(Invocation invocation)  throws Throwable ;
    public Object register(Object target);
}
{% endhighlight%}


拦截器实现：
{% highlight java %}
@MethodName("execute1")
public class InterceptorImpl implements Interceptor {

    public Object intercept(Invocation invocation)throws Throwable {
        System.out.println("Go Go Go!!!");
        return invocation.proceed();
    }

    public Object register(Object target) {
        return TargetProxy.bind(target, this);
    }
}
{% endhighlight%}

客户端调用：
{% highlight java %}
Target target = new TargetImpl();
Interceptor interceptor = new InterceptorImpl();

target = (Target)interceptor.register(target);
target.execute1();
{% endhighlight%}

#### 七、Mybatis的拦截器实现

OK，上面的一系列过程其实都是mybatis的拦截器代码结构，我只是学习了之后用最简单的方法理解一遍罢了。    
上面的TargetProxy其实就是mybatis的Plug类。Interceptor和Invocation几乎一样。    
只是mybatis的Interceptor支持的注解更加复杂。    
mybatis最终是通过将自定义的Interceptor配置到xml文件中：
{% highlight xml %}
<!-- 自定义处理Map返回结果的拦截器 -->
<plugins>
<plugin interceptor="com.gs.cvoud.dao.interceptor.MapInterceptor" />
</plugins>
{% endhighlight%}

通过读取配置文件中的Interceptor，通过反射构造其实例，将所有的Interceptor保存到InterceptorChain中。
{% highlight java %}
public class InterceptorChain {
    private final List<Interceptor> interceptors = new ArrayList<Interceptor>();
    public Object pluginAll(Object target) {
        for (Interceptor interceptor : interceptors) {
            target = interceptor.plugin(target);
        }
        return target;
    }

    public void addInterceptor(Interceptor interceptor) {
        interceptors.add(interceptor);
    }

    public List<Interceptor> getInterceptors() {
        return Collections.unmodifiableList(interceptors);
    }
}
{% endhighlight%}

mybatis的拦截器只能代理指定的四个类：ParameterHandler、ResultSetHandler、StatementHandler以及Executor。    
这是在mybatis的Configuration中写死的，例如（其他三个类似）：
{% highlight java %}
public ParameterHandler newParameterHandler(MappedStatement mappedStatement, 
        Object parameterObject, BoundSql boundSql) {
    ParameterHandler parameterHandler = 
        mappedStatement.getLang().createParameterHandler(mappedStatement, 
            parameterObject, boundSql);

    //将配置文件中读取的所有的Interceptor都注册到ParameterHandler中，最后通过每个Interceptor的注解判断是否需要拦截该ParameterHandler的某个方法。
    parameterHandler = (ParameterHandler) interceptorChain.pluginAll(parameterHandler);
    return parameterHandler;
}
{% endhighlight%}
所以我们可以自定义mybatis的插件（拦截器）修改mybatis的很多默认行为，   
例如，   
通过拦截ResultSetHandler修改接口返回类型；    
通过拦截StatementHandler修改mybatis框架的分页机制；    
通过拦截Executor查看mybatis的sql执行过程等等。