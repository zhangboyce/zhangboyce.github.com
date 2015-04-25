---
layout: post
title: InputStream为什么不能被重复读取？
---

熟悉Java的人可能都知道，Java中的Inputstream是不能重复读取的。    
但是有不少同学问我，为什么Stream不能重复被读取。
为了理解InputStream为什么不能被重复读取，我们把InputStream的读取和List的遍历做一个
比较，情况可能就比较清楚了。 

#### 一、 List 为什么能够重复遍历？

猛然一看可能觉得这个问题很低级，但是正是因为List的这些特点Stream不具备，
才导致我们如果“不借助外力”很难重复读取一个Stream的根本原因。

List能够支持被重复遍历的主要特点：    
<b>List对象持有并一直（直到List对象本身被回收）持有其内所有的对象引用。</b>
{% highlight java %}
public class ArrayList<E> extends AbstractList<E>
        implements List<E>, RandomAccess, Cloneable, java.io.Serializable {
   ...

    /**
     * The array buffer into which the elements of the ArrayList are stored.
     * The capacity of the ArrayList is the length of this array buffer. Any
     * empty ArrayList with elementData == EMPTY_ELEMENTDATA will be expanded to
     * DEFAULT_CAPACITY when the first element is added.
     */
    private transient Object[] elementData;

    /**
     * The size of the ArrayList (the number of elements it contains).
     *
     * @serial
     */
    private int size;

    ...
}
{% endhighlight %}
所以List是一容器，一个篮子，你能重复遍历就好比你能重复把篮子里面的橘子拿出来看看。

#### 二、Stream 的特点
* 对于数据的来源、大小不知道，或者说不关心。
* 无法事先确定什么时候才算是读完Stream。（所以必须是读到最后发现没有数据了返回-1）
* 除非自身缓存，否则无法一直持有数据对象。

所以，Stream是一个管道，是一个数据流而不是一个容器。管道只负责数据的流通而不负责数据的
存储（当然可以适当使用缓存来增加读取速度）。    
所以，重这个角度来讲，讨论*“InputStream为什么不能被重复读取？”*未免就有些可笑了，因为，理所当然。



