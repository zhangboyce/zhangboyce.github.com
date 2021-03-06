---
categories: algorithm
layout: post
title: 一个随机数算法的解答与分析
---

{% include mathjax.html %}

> 描述RANDOM(a,b)的过程的一种实现，它只调用RANDOM(0,1)。作为a和b的函数，你的程序的期望运行时间是多少？    
注：RANDOM(0,1)以等概率输出0或者1，要求RANDOM(a,b)以等概率输出[a,b]之间的数(整数)。

<!-- more -->    

#### 一、二分法查找的可行性分析
看到这个题目的第一反应是采用二分查找来解决问题：    
{% highlight java %}
RANDOM_A_B(a,b)
   if (a == b) return a
   m = RANDOM(0,1)
   if (m == 0) 
       return RAMDOM_A_B(a, a + floor((b-a+1)/2) )
   else  
       return RAMDOM_A_B(a + ceil((b-a+1)/2), b)
{% endhighlight %}
咋一看没有什么问题，但是考虑当(b-a+1)是奇数，即a到b之间的元素个数是奇数个的时候。
无论 (b-a+1)/2 向下取整还是向上取整，都无法平均分割 a到b的所有元素。所以以上算法不可行。    

所以，要想以上算法可行，必须满足一个条件：<b>每一次的(b-a+1)都是偶数</b>，那么当a, b满足什么条件时，
才能使每一次(b-a+1)都是偶数呢？    

#### 二、二分法查找的决策树分析

如果我们把每一次调用RANDOM(0,1)函数看成是一次决策选择，结果只有两个，向左或者向右。以此我们可以
绘制如下一颗决策树：
![Alt text]({{ site.url }}/assets/images/20150423_tree1.jpg)
图中，每一个非叶子节点（1，2，3）都是一次决策选择，对应一次调用RANDOM(0,1)，如果返回0，走左子树，如果是1，
走右子树，直到找到某个叶节点，每一个叶节点是返回的最终的值。   
所以，要保持每一次决策选择都会以等概率的几率选择左子树还是右子树 ，就必须保证每一个非叶子节点都是满节点，即整棵决策树是
一颗满树。  

即叶节点的数目必须等于 \\({2}^{h}\\) (h是树的高度)，所以构建一个最小高度的满树       
$$ h=\left\lceil \log_{2}{b-a+1}\right\rceil $$    
此时每一个叶节点被作为最终值被返回的概率都是    
$$ { 1 }/{ { 2 }^{ h } } $$   
其中叶节点中属于\\(\left[ a,b \right] \\)中的元素个数为     
$$ b-a+1 $$    
不属于\\(\left[ a,b \right] \\)中的元素个数为    
$$ {2}^{h}-(b-a+1) $$     

如果决策树最终返回的元素值属于\\(\left[ a,b \right] \\)中的一个，则程序终止，成功。    
如果决策树最终返回的元素值不属于\\(\left[ a,b \right] \\)，则继续重试。        
很明显，每一次决策树成功的概率为
$$ p={ (b-a+1) }/{ { 2 }^{ h } } $$
失败的概率\\({q=1-p}\\)。    

那么整个算法的期望运行时间为：
<b>    
T = 调用一次RANDOM(0,1)函数的时间 *     
h = 决策树每遍历一次需要调用h次RANDOM(0,1函数) *     
X = 失败次数   
</b> 

设指示器随机变量    
$$ X(i)=I\{第i次失败 \} =\left\{ { 1, 如果第i次失败}|{ 0, 如果第i次不失败} \right\} $$     
则总的失败次数的变量    
$$ X=\sum _{ i=1 }^{ \infty }{ X(i) } $$    
所以，总的失败次数的期望值    
$$E(X) = E\left[ \sum _{ i=1 }^{ \infty  }{ X(i) }  \right] = \sum _{ i=1 }^{ \infty  }{ E(X(i)) } $$      
因为       
$$ E(X(i)) = Pr\{第i次失败\} = { q }^{ i }(即第i次失败就是连续i次失败)$$    
所以   
$$ E(X)=\sum _{ i=1 }^{ \infty  }{ { q }^{ i } } =\frac { 1-{ q }^{ \infty  } }{ 1-q } =\frac { 1 }{ 1-q } (q<1)=\frac { 1 }{ p } =\frac { { 2 }^{ h } }{ b-a+1 } $$  

所以，最终期望时间为    
$$ O(T\cdot h\cdot ({ { 2 }^{ h } }/{ b-a+1 })),其中h=\left\lceil \log_{2}{b-a+1}\right\rceil $$  
所以，正确有效的二分法伪代码大概如下：
{% highlight java %}
s = ceil(lg(b-a+1))
while (v = RANDOM_A_B(a, s) > b)
    v = RANDOM_A_B(a, s)

RANDOM_A_B(a,b)
   if (a == b) return a
   m = RANDOM(0,1)
   if (m == 0) 
       return RAMDOM_A_B(a, a + floor(s/2)
   else  
       return RAMDOM_A_B(a + ceil(s/2), b)
{% endhighlight %}

#### 三、决策树查找的二进制分析   
![Alt text]({{ site.url }}/assets/images/20150423_tree2.jpg)
如图，如果我们把所有决策树向左子树查找的路径设为0，向右子树选择的路径设为1。
那么叶节点上的所有元素对应的路径集合分别是00，01，10，11。    
推广到更一般的情况，可以得出以下明显的结论：

1. 从左至右叶节点所对应的路径集合的二进制值转换为十进制分别是：1,2,3...n。
2. 每一个叶节点对应的二进制数的bit位数等于决策树的高度h，如上图为2。
3. 叶节点上每个节点对应的值分别是：a+0,a+1,a+2...a+n。
4. 上述三条结论中h和n的关系是：n=2^0+2^1+...+2^(h-1) = 2^h - 1，其中其中h=lg(b-a+1)向上取整。    
5. 二进制实现的伪代码大概如下：
{% highlight java %}
h = ceil(lg(b-a+1))
RANDOM_A_B(a,b)
    r=0
    for i = 1 to h
        r = 2*r + RANDOM(0,1)
    if r ≤ (n=2^h-1)
        return r + a
    else 
        RANDOM_A_B(a,b)
{% endhighlight %}
期望运行时间的分析同决策树分析大同小异。












