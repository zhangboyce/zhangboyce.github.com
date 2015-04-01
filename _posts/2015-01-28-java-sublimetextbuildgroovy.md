---
title: 在Sublime Text客户端编译运行Groovy代码
---

#### 1. 手动安装Groovy
* [下载](http://groovy.codehaus.org/Download)一个Groovy的二进制发布包并解压到本地目录中。
* 设置GROOVY_HOME环境变量。
* 添加GROOVY_HOME/bin到PATH环境变量中。
* 设置JAVA_HOME环境变量指向安装的JDK目录，OS X系统通常在/Library/Java/Home下，其他unix系统
通常在/usr/java 目录下。

一切事情做完之后可以在shell命令行输入：groovysh，将会打开Groovy的shell命令行模式。  
也可以shell命令行输入：groovyConsole，打开一个Groovy的swing控制台。

#### 2. GVM安装Groovy
在 Mac OSX, Linux 等操作系统中，可以直接使用GVM (the Groovy enVironment Manager)对Groovy
进行下载，安装和版本管理。   
当然，首先你得安装GVM，安装完GVM之后就一劳永逸了，以后安装管理Groovy，Grail等就简单多了。 
[GVM官网](http://gvmtool.net/)已经对GVM以及其安装使用进行了详尽的介绍。我们这里只需两步：  
1. 安装GVM，终端输入：     

    curl -s get.gvmtool.net | bash


注意官网的这段话，可能是你执行以上命令失败的原因。   
（GVM is written in bash and only depends on curl and unzip to be available 
on your system. The installer will check for these before completing the 
installation process. It will then create a .gvm/ folder in your home directory, 
and neatly install all candidates beneath it.）  
2. 利用GVM安装Groovy：   

    gvm install groovy 

GVM会直接安装Groovy的默认版本，当然也可以指定版本安装，官网有详述，不再累述。  
至此，Groovy就安装完成了。  

#### 3. 配置Sublime Text
默认你已经安装了Sublime Text。  
然后找到~/Library/Application Support/Sublime Text 2/Packages/User/groovy.sublime-build文件。
没有文件创建文件，没有目录创建目录。然后将以下内容保存到groovy.sublime-build文件中。

	{
	 	"cmd": ["/usr/local/groovy/bin/groovy", "$file"],
	 	"selector": "source.groovy"
	}

注意/usr/local/groovy/bin/groovy是你安装Groovy的bin路径，如果使用GVM安装，可能是你用户
根目录下的/.gvm/groovy/current/bin/groovy。

至此，一切就准备就绪了，你就可以在你强大的Sublime Text客户端编写并按 shift + command + b执行Groovy
脚本了。还是非常方便的，比命令行方便，比Groovy自己的console强大，比IDE轻量。

#### 4. 关于需要的jar文件问题
将需要的jar文件拷贝到$HOME/.groovy/lib目录中即可。



