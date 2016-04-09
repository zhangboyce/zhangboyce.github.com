---
layout: post
title: Java程序设计，你属于哪一流派？
---

这个话题也是我在程序开发过程中常常会遇到的困惑，程序到底应该设计成什么样子？    
诚然，是个程序员都知道程序设计应该要做到低耦合，高复用，高扩展等等。
但是怎么设计才能达到这样的程序以及那个度的把握也常常是很困惑的。
在我的工作中接触了很多Java程序员，大多数的程序员设计风格都大相径庭，这里暂且不说孰优孰劣，
先就我遇到的程序员们分个派别，你属于哪一派呢？    
<!-- more -->

#### 一、Java程序设计的流派总览

<b>1. 拿来主义派</b>

特点：要解决一个问题，现在网上或者自己过去的程序找到相应的代码，拿过来改改能用，OK，结束。    
好处：效率高。    
坏处：如果对代码理解不透彻，可能造成维护上的困难。    

<b>2. 纯代码派</b>

特点：写代码从来不写注释，坚持我的程序只有我能懂的编码原则。    
好处：保密性高，可以很好的搞晕对手。    
坏处：也容易搞晕自己和队友。    

<b>3. 复制黏贴派</b>

特点：一模一样的代码到处都是，这一派坚信，即使要改，只要有伟大的IDE，全文替换还是很方便的。    
好处：增加代码量，从而有利于提高个人职业生涯的代码行数据。    
坏处：可能导致不会用IDE全文替换的队友住院。    

<b>4. if else派</b>

特点：这一派逻辑思维极强，将Java语言的流程控制发挥到了极致，如果业务允许，一个三元表达式可以写3000行。    
好处：在一段代码内把事情搞定，不用整许多类调来调去。    
坏处：容易导致{}就占200行，浪费IDE空间。直接导致队友住院。    

<b>5. 接口派</b>

特点：任何类都要写个接口，深谙Java多态的思想。    
好处：面向接口编程，扩展性极强。    
坏处：写接口也有很多技巧性，设计得不恰当也不见得接口多就是好事，反而导致代码很乱。    

<b>6. 工具类派</b>

特点：能用工具类就用工具类，不能用工具类努力也要用工具类。    
好处：工具类简单直接，便于阅读。    
坏处：首先工具类其本身也有一些缺点，其实工具类不符合面向对象编程的思想，程序很难扩展。    

<b>7. 过度设计派</b>

特点：将平生所学都要用尽全力用在实现一个功能上，该用上的设计模式都得用上，各种封装，各种接口。    
好处：程序设计的好便于扩展，重用。    
坏处：过度的设计可能导致程序更难懂，浪费工作效率，有可能根本就没有你想象的那些扩展场景。    

<b>8. 其他门派</b>

特点：五花八门    
好处：百花齐放    
坏处：良莠不齐    

说实话程序设计还真是一件挺麻烦的事情，自己做一个工具或者软件怎么都好说，自己爱怎么写怎么写。
但是当我们处在一个团队中时，很多事情就变得不是那么简单。    

一方面团队成员水平高低有限，有的就只看得懂静态类，你整个设计模式他反而看不懂，
所以这个时候代码可读性的定义是否就不是我们说的那么简单，是将就团队成员，
还是考虑代码的结构和优美，其实都同等重要，我们要做的就是多学习，多提高，
尽量懂得Java设计的标准和原则，只要大家都懂得这些标准和原则团队成员之间还是能很好的配合的。    

二一方面可能每个团队都有他们自己的一些标准和原则，也要尽量遵守，以便成员之间更好的沟通，
以便团队之间更好的协作。    

三一方面需求永远是变化的，永远是揣摩不透的，我们只能尽量做到易扩展易重用，
但是你永远做不到尽善尽美，举个很极端的例子，你一个模块设计得再好，如果下一次这个功能不用了，
再好的代码也得删除。    

#### 二、举个栗子

举个实际的例子，项目中要使用Gson解析工具，实现将对象和Json的互相转换：

<b>【场景1】</b>有的人这么写：
{% highlight java %}
//GsonBuilder采用的就是建造者模式
GsonBuilder builder = new GsonBuilder();
//设置builder的很多属性
builder.setDateFormat("yyyy-MM-dd");
Gson gson = builder.create();
String json = gson.toJson(obj);
{% endhighlight %}
下一次需要使用Gson的时候同样一段代码整上去：
{% highlight java %}
GsonBuilder builder = new GsonBuilder();
builder.setDateFormat("yyyy-MM-dd");
Gson gson = builder.create();
String json = gson.toJson(obj);
{% endhighlight %}

<b>【场景2】</b>有的人认为我得整个方法重用一下，于是就这么写：
{% highlight java %}
//静态方法获取Gson
public class GsonCreator {
    public static Gson createGson() {
        GsonBuilder builder = new GsonBuilder();
        builder.setDateFormat("yyyy-MM-dd");
        Gson gson = builder.create();
        
        return gson;
    }
}

//使用
Gson gson = GsonCreator.createGson();
String json = gson.toJson(obj);

//再次使用
Gson gson = createGson();
String json = gson.toJson(obj);
{% endhighlight %}

<b>【场景3】</b>有的人认为，在我的项目中，其实每一个使用Gson的地方我需要的builder都不一样，都需要设置不同的参数，于是：
{% highlight java %}
public class GsonCreator {
    public static Gson createGson(GsonBuilderAttributeSetter gsonBuilderAttributeSetter) {
        GsonBuilder builder = new GsonBuilder();
        gsonBuilderAttributeSetter.setAttribute(builder);
        Gson gson = builder.create();
        
        return gson;
    }
    
    public static interface GsonBuilderAttributeSetter {
        public void setAttribute(GsonBuilder gsonBuilder);
    }
}

//使用的时候
Gson gson = GsonCreator.createGson(new GsonBuilderAttributeSetter() {
    public void setAttribute(GsonBuilder gsonBuilder) {
        gsonBuilder.setDateFormat("yyyy-MM-dd");
        gsonBuilder.setPrettyPrinting();
    }
});
String json = gson.toJson(obj);
{% endhighlight %}

当然，我可以将我项目中大多数的builder使用场景构建一个默认的GsonBuilderAttributeSetter于是，GsonCreator类就变成：
{% highlight java %}
public class GsonCreator {
    //需要使用的时候自己设置GsonBuilder属性
    public static Gson createGson(GsonBuilderAttributeSetter gsonBuilderAttributeSetter) {
        GsonBuilder builder = new GsonBuilder();
        gsonBuilderAttributeSetter.setAttribute(builder);
        Gson gson = builder.create();
        
        return gson;
    }
    
    //重写一个无参的createGson方法，使用默认的GsonBuilderAttributeSetter
    public static Gson createGson() {
        return createGson(new DefaultGsonBuilderAttributeSetter());
    }
    
    public static interface GsonBuilderAttributeSetter {
        public void setAttribute(GsonBuilder gsonBuilder);
    }
    
    //默认的GsonBuilderAttributeSetter
    public static class DefaultGsonBuilderAttributeSetter
                                                implements GsonBuilderAttributeSetter {
        public void setAttribute(GsonBuilder gsonBuilder) {
            if (null == gsonBuilder)
                return;
            gsonBuilder.setDateFormat("yyyy-MM-dd");
        }
    }
}

//如果使用默认的GsonBuilderAttributeSetter的使用场景
Gson gson = GsonCreator.createGson();
String json = gson.toJson(obj);
{% endhighlight %}

<b>【场景4】</b>有的人又认为，在我的项目中，不仅要使用Gson做json的解析，
有的地方还需要使用其他的json解析工具，比如Jackson，因为Gson序列化时并不是调用对象的getter方法，这会导致很多不爽。
甚至有的地方需要使用json-lib自己解析json。当然了，实际上并不提倡项目里实现一个功能用多种不同的技术，尽量要做到统一，
这儿只是为了举例子而举例子，假想的业务需求。可能不大恰当，不管了。总之，就是有的人项目中需要使用不同的第三方工具或者自己写的工具解析Json。
那么我就需要自己封装一个接口，以便在项目中统一使用自己封装的接口。
{% highlight java %}
//自定义解析接口，简单起见就没有提供别的方法
public interface JsonBuilder {
    /**
     * 将一个Object对象转换成json字符串
     */
    public String toJson(Object object);
    
    /**
     * 将一个json字符串转换成指定Class类型的对象
     */
    public <T> T toObject(String json, Class<T> clazz);
}
{% endhighlight %}
Gson解析方式的实现类，设计成单例。
{% highlight java %}
public class Gson4JsonBuilder implements JsonBuilder {
    
    //私有构造方法
    private Gson4JsonBuilder() {}
    
    /**
     * 获取单实例
     */
    public static JsonBuilder getInstance() {
        return Gson4JsonBuilderGenerateor.JSON_BUILDER;
    }
    
    public String toJson(Object object) {
        return gson().toJson(object);
    }
    
    public <T> T toObject(String json, Class<T> clazz) {
        return gson().fromJson(json, clazz);
    }
    
    //新建一个Gson 基于GsonBuilder
    private static Gson gson() {
        return new GsonBuilder().setDateFormat("MM/dd/yyyy HH:mm:ss").create();
    }
    
    //静态内部类产生单例实例
    private static class Gson4JsonBuilderGenerateor {
        private final static JsonBuilder JSON_BUILDER = new Gson4JsonBuilder();
    }
    
}
{% endhighlight %}
Jackson解析方式的实现类：
{% highlight java %}
public class ObjectMapper4JsonBuilder implements JsonBuilder {
        
    private ObjectMapper objectMapper;
    //私有构造方法
    private ObjectMapper4JsonBuilder() {
        objectMapper = new ObjectMapper();
        objectMapper.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
        objectMapper.disable(DeserializationConfig.Feature.FAIL_ON_UNKNOWN_PROPERTIES);
        //关闭时间戳输出，此时是ISO格式
        objectMapper.configure(SerializationConfig.Feature.WRITE_DATES_AS_TIMESTAMPS, false);  
       	//设置自己的格式
        objectMapper.setDateFormat(new SimpleDateFormat("MM/dd/yyyy HH:mm:ss"));  
    }
    
    public String toJson(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
        }
        return null;
    }
    
    public <T> T toObject(String json, Class<T> clazz) {
        try {
            return objectMapper.readValue(json, clazz);
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
        } 
        return null;
    }
    
    /**
     * 获取单实例
     */
    public static JsonBuilder getInstance() {
        return ObjectMapper4JsonBuilderGenerateor.JSON_BUILDER;
    }
    
    //静态内部类产生单例实例
    private static class ObjectMapper4JsonBuilderGenerateor {
        private final static JsonBuilder JSON_BUILDER = new ObjectMapper4JsonBuilder();
    }
{% endhighlight %}
使用方式如下：
{% highlight java %}
//使用Gson解析
String json = Gson4JsonBuilder.getInstance().toJson(obj);
//使用Jackson解析
String json = ObjectMapper4JsonBuilder.getInstance().toJson(obj);
{% endhighlight %}
很明显，上述的设计是有一个问题的，那就是每一个JsonBuilder的实现内部都可能使用了自己的API，比如GsonBuilder，ObjectMapper，甚至自己用json-lib实现的话也是要使用其特有的API。那么如果我们的接口（如上述）隐藏了内部实现细节，那么意味着<b>接口将不提供方法操作其实现细节，因为接口并不关心实现细节</b>，这就导致了一个问题，那就是我们使用接口无法修改GsonBuilder或者ObjectMapper所设置的属性。以上两个实现都是默认的设置了属性，接口并没有提供方法对其修改，也无法提供，因为接口并不知道你的实现类的一切细节，换句话说就是定义接口的时候你根本不知道用户怎么去实现你的接口，更别说用什么API了。
当然我们可以在我们自己的实现类中暴露自己的一些特有的方法，比如设置GsonBuilder或者ObjectMapper的属性。在使用的时候通过强转成自己的实现类就行设置属性。

<b>【场景5】</b>有的人又认为了，其实项目中只需要一直方式解析json，但是我需要非常灵活的切换，从一种方式换到另一种方式游刃有余。如果是【场景4】的方式，虽然客户端使用还是很简单，但是需要切换的时候还是需要将每一个Gson4JsonBuilder换成ObjectMapper4JsonBuilder，
反之亦然，当然有强大的IDE全文替换也不是什么难事，但是个人觉得这始终不是解决问题的方式。所以再写一个统一的JsonBuilder封装一下就可以了，有一点点代理的意思：
{% highlight java %}
public final class JsonBuilderExecutor implements JsonBuilder {
    
    //使用指定的JsonBuilder，要切换就换一种实现方式，客户端调用不用变化
    private JsonBuilder jsonBuilder = ObjectMapper4JsonBuilder.getInstance();
    private JsonBuilderExecutor() {}
    
    public String toJson(Object object) {
        return jsonBuilder.toJson(object);
    }
    
    public <T> T toObject(String json, Class<T> clazz) {
        return jsonBuilder.toObject(json, clazz);
    }
    
    private static class JsonExecutorGenerateor {
        private final static JsonBuilder JSON_BUILDER = new JsonBuilderExecutor();
    }
    
    public static JsonBuilder getInstance() {
        return JsonExecutorGenerateor.JSON_BUILDER;
    }
{% endhighlight %}
客户端使用：
{% highlight java %}
String json = JsonBuilderExecutor.getInstance().toJson(obj);
{% endhighlight %}

#### 三、关于扯的犊子

扯了这么多犊子，从来都没有说哪一种方式好与不好，我的观点是什么方式能够更好的解决你的问题哪种方式就是好的方式。    

当然，还是那句老话，软件开发设计是一个很灵活的工作，留给程序员的创造空间很大，我一向都认为编码是一项富有想象力，
创造力和艺术气息的工作，关键在于我们程序员自己怎么去很好的利用这其中的创造空间，既能很好的解决问题，又能让它变成一项富有乐趣的事情。

要做到这一点，唯有不断的提高自己，不断的Coding，不断的总结，不断的问问自己还有还有更好，这是不是最好，这样有什么缺点，这样做是为什么。
总之，不断的学习总结交流，不怕不懂，就怕不学，不问，不思考。

所以，我们都应该祝福自己是一个程序员，少吐槽，少抱怨，少自我贬低，每一项工作都有它的乐趣，关键是你自己怎么看，而不是元芳怎么看。
