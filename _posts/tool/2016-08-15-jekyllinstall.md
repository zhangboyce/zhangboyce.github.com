---
categories: tool
layout: post
title: 此处有坑之Jekyll安装
---

关于什么是Jekyll以及Jekyll是干嘛用的，[官网http://jekyllcn.com/](http://jekyllcn.com/)有非常详尽的介绍。
不管是搭建静态博客还是希望在本地启动一个Jekyll的服务方便在本地预览自己博客。都需要首先安装
Jekyll。    

#### 一、你可能会遇到的坑
由于国内的网络原因，你的安装往往不会顺风顺水，这就是我记录下这篇博客的原因。首先按照官网的文档尝试安装，执行：
{% highlight shell %}
sudo gem install jekyll
{% endhighlight %}
当你输入密码，然后怀着紧张和不安的心情等待几秒钟后，眼前的一切对你来说是崩溃的。
{% highlight shell %}
ERROR:  Could not find a valid gem 'jekyll' (>= 0), here is why:
Unable to download data from https://rubygems.org/ - Errno::ETIMEDOUT: Operation
timed out - connect(2) (https://rubygems.org/latest_specs.4.8.gz)
ERROR:  Possible alternatives: jekyll
{% endhighlight %}
对，你没有看错，不是WARN，是ERROR！！！是ERROR！！！我想拥有日志级别的英文水平的你已经迅速的定位到了
问题的所在，多么醒目的**Unable to download data from https://rubygems.org/**。    

于是我们可以尝试一下在浏览器访问一下https://rubygems.org/。理论上是访问不到的，但是就在我写到
这儿的时候我本着治学严谨的精神访问了一下，尼玛，居然不小心打开了，一片橘红的rubygems官网映入眼帘，这是我第一次因为能打开一个网站而感到失望。 收拾一下受精的心情，一定是我打开的姿势不对，我刷我刷我刷刷刷，然而橘红依旧。    

后来我发现我开了代理，总之我关闭代理，在shell里面curl，甚至重新修改gem的sources为https://rubygems.org/再重新随便安装一个RubyGems，依旧刷刷的成功。 所以，可能是偶尔会有网络问题。不管了，总之我遇到过不止一次。    

辣么，遇到了该肿么办呢？

#### 二、勇敢的跨过这个坑

具有资深工程师的抬头的你，一定能在茫茫的Google搜索引擎中找到答案，没有错，就是**修改gem的sources**，你可以尝试
一下执行：
{% highlight shell %}
gem sources -l
{% endhighlight %}
如果你看到
{% highlight shell %}
*** CURRENT SOURCES ***
https://rubygems.org/
{% endhighlight %}
将他修改为一个国内的RubyGems镜像即可。推荐伟大的淘宝提供的[https://ruby.taobao.org/](https://ruby.taobao.org/)镜像，并修改之：
{% highlight shell %}
gem sources --add https://ruby.taobao.org/ --remove https://rubygems.org/
{% endhighlight %}

至此，你应该能顺风顺水的安装了。
安装完毕之后，你怀着满心欢喜准备运行Jekyll。
{% highlight shell %}
jekyll serve
{% endhighlight %}
如果你成功了，恭喜你。然而如果你的_config.yml配置文件中配置了分页插件gems: [jekyll-paginate]，你还需要照猫画虎的安装jekyll-paginate：
{% highlight shell %}
sudo gem install jekyll-paginate
{% endhighlight %}

完事儿后你就可以在本地启动Jekyll，然后为所欲为了。




