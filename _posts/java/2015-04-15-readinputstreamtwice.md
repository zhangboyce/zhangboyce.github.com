---
layout: post
title: 重复读取InputStream的方法
---

在有的场合中，我们需要重复利用InputStream的数据，比如：    

* 一个office word文件流，我需要首先读取InputStream中的前一些字节来判断word文件的实际内容（word文件可以保存html，mht的内容）。然后再根据实际内容决定我要解析InputStream的方式。
* 一个Html文件流，我需要首先读取InputStream中的一些字节来判断Html文件编码方式。然后再根据html文件编码方式读取Html内容。
* 从socket收到的一个InputStream，我首先需要读取InputStream判断是什么类型的字符串。然后再将InputStream读取写到文件里。

#### 一、主动通过Stream流获取数据的情况

一般来讲，如果我们是主动创建的Stream获取数据流，是没有你要重复读取一个Stream流的，因为
大不了我们可以重新获取一个Stream流，例如：

{% highlight java %}
InputStream inputStream = new FileInputStream(path);
//利用inputStream
inputStream = new FileInputStream(path);
//再次利用inputStream
{% endhighlight %}
再例如：
{% highlight java %}
InputStream inputStream = httpconn.getInputStream(); 
//利用inputStream
inputStream = httpconn.getInputStream();
//再次利用inputStream
{% endhighlight %}

当然，有时候我们可能会考虑到网络连接，读取速度等原因，不愿意重新建立网络或者文件的
连接，这个时候其实也是有必要读取一个Stream流的。

#### 二、被动通过Stream流获取数据的情况

例如有这样一个接口：
{% highlight java %}
//将InputStream转换成一个文本字符串
public String convert(InputStream inputStream);
{% endhighlight %}
这种情况下，Stream是外部接口提供给我们的，我们没有办法要求外部接口去重新获取新的Stream。    
如果在接口内部我们需要首先读取InputStream前n个字节来判断InputStream流的数据流型，然后转化InputStream为一个字符串。
这个时候就必须要重复读取一个Stream了。

#### 三、最简单的方法 —— 缓存
最简单的方式就是缓存，首先将InputStream缓存到内存，然后重复使用内存里的数据。例如：
{% highlight java %}
public class InputStreamCacher {
	//将InputStream中的字节保存到ByteArrayOutputStream中。
	private ByteArrayOutputStream byteArrayOutputStream = null;
	public InputStreamCacher(InputStream inputStream) {
		if (ObjectUtils.isNull(inputStream))
			return;
		
		byteArrayOutputStream = new ByteArrayOutputStream();
		byte[] buffer = new byte[1024];  
		int len;  
		try {
			while ((len = inputStream.read(buffer)) > -1 ) {  
				byteArrayOutputStream.write(buffer, 0, len);  
			}
			byteArrayOutputStream.flush();
		} catch (IOException e) {
			logger.error(e.getMessage(), e);
		}  
	}
	
	public InputStream getInputStream() {
		if (ObjectUtils.isNull(byteArrayOutputStream))
			return null;
		return new ByteArrayInputStream(byteArrayOutputStream.toByteArray());
	}
}
{% endhighlight %}
接口内部使用情景：
{% highlight java %}
InputStreamCacher  cacher = new InputStreamCacher(inputStream);
InputStream stream = cacher.getInputStream();
//读取stream
stream = cacher.getInputStream();
{% endhighlight %}

当然也可以自己实现一个InputStream，然后其持有一个InputStream对象的引用。然后在内部
做一些缓存什么的，本质上都是缓存。    

上述的方式是将InputStream缓存到一个ByteArrayOutputStream中，当然缓存的数据类型和方式都是任意的，这只是一种解决思路。    
这种方式有一个最大的缺点，就是内存压力。    
外部传给接口的InputStream有可能很大。每调用一次接口就将InputStream缓存到内存中，内存要承受的压力是可想而知的。    

编程永远都是在时间和空间之间找到一个平衡点，前面说的“主动获取方式”的重复获取也有它的缺点，就是需要重新读取文件，获取重新建立网络连接等，这就是需要消耗更多的时间。    
万事万物都是这样，天下没有完美的事，有舍才有得，选择什么就意味着放弃什么，开了一扇窗可能就要关一扇门。所以不管是生活还是编程，我们都需要在舍与得，选择的与放弃的，
窗和门之间做出相对合理的抉择，或者说不得不做的抉择。
