---
categories: tool
layout: post
title: Jekyll中的permalink配置
---

如果还不知道Jekyll是什么神器的同学，请移步[这里](http://jekyllcn.com/)，简单来说
Jekyll就是一个将纯文本转化为静态网站的工具。Github Pages也是基于Jekyll构建，所以可以
轻易而举的利用Jekyll+Github Pages搭建你的博客平台。在下这个博客平
台就是基于Jekyll+Github搭建的，当然不管是Jekyll还是GithubPages都提供了
许多免费的收费的主题，五花八门，琳琅满目，任君选择。  
关于Jekyll和Github Pages有更多详细的文档可以学习。    

我在利用Jekyll管理我本地_posts博客目录的时候，往往我会根据post的种类分别将post放到不同的目录下，但是Jekyll将post生成html文件并移动到_site目录下面时，所有的post都被放到了_site目录的根目录下，这样不仅不便于查阅，而且post的访问url也没有层次。    

要想解决这个问题，只需要Jekyll的permalink配置即可。Jekyll 可以在_config.yml配置文件中配置permalink属性。    

默认配置: permalink: /:title/  
显示post的url: http://127.0.0.1:4000/posttile  
post的html文件直接生成到 _site 目录的根目录下。  

具体的 permalink 的配置方式和类型可以参考[官网](http://jekyllcn.com/docs/permalinks/)

我的配置是： **permalink: /:categories/:year/:month/:day/:title/**  
对应的URL格式：**http://127.0.0.1:4000/tool/2016/03/08/jekyllpermalink/**

这样配置之后，最好post目录下文章的目录和category保持一致，
比如可以将：_posts/java/corejava/ 目录下面的post
的categories 都统一配置成:    

\-\-\-  
categories: java/corejava  
layout: post  
title: java thread  
\-\-\-

这样不仅post的 url 能按照category展示(如果permalink配置了categories)，而且我们也便于管理自己的post，_site目录也会按照permalink的配置风格将post生成到不同的目录下面去。

当然，除了在_config.yml统一配置permalink之外，也可以在具体的 post 里面配置该属性:

\-\-\-  
permalink: date  
categories: java/corejava  
layout: post  
title: java thread  
\-\-\-

这样 该post的permalink属性优先会选择在post里面配置的，这个很好理解。但是一般情况下，我们还是会选择在_config.yml文件里面统一配置博客风格，没有理由每个post都有不一样的风格。