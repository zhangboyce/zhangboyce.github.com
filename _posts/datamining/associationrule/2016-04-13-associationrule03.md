---
categories: datamining/associationrule
layout: post
title: 数据挖掘-关联规则-从k-候选项集生成k-频繁项集
---

[上一节](/datamining/associationrule/2016/04/08/associationrule02/)我们给出了频繁项集的生成过程以及策略。简单的可以分为三个步骤：    
1. 由k-项集根据最小支持度过滤出k-频繁项集。     
2. 由k-频繁项集生成(k+1)-项集，可以称为候选项集。  
3. 然后重复第1步。  

这集主要讨论从k-候选集生成k-频繁项集的过程。  

从k-候选集生成k-频繁项集的过程其实很简单，就是计算该k-候选项集的支持度是否大于等于最小支持度minsup。
所以，最重要的一件事情就是计算k-候选项集的支持度。    
sup = (X∪Y)∙count/n， 其中n是总的事务，(X∪Y)∙count是指所有的事务中包含(X∪Y)项集的数量。  
首先定义项的对象，为了方便，所有的代码都用Groovy编写：
{% highlight groovy %}
class Item {
    def value
}
{% endhighlight %}
然后定义事务对象，每个事务对象都可以简单的看成是一个项的集合：
{% highlight groovy %}
class Transaction {
    List<Item> items
    String name
}
{% endhighlight %}
然后我们有一个事务集合，和若干候选项集，看看怎么以最简单的方式计算项集的支持度。
{% highlight groovy %}
//创建Item
final Item xgang = new Item(value: "小刚")
final Item xhong = new Item(value: "小红")
final Item xming = new Item(value: "小明")
final Item xyang = new Item(value: "小杨")
final Item xliu  = new Item(value: "小刘")
final Item xli   = new Item(value: "小李")

// 创建事务
Transaction mon = new Transaction(name: "周一", items: [xgang, xhong])
Transaction tue = new Transaction(name: "周二", items: [xhong, xming, xyang, xliu])
Transaction wed = new Transaction(name: "周三", items: [xgang, xming, xyang, xli])
Transaction thu = new Transaction(name: "周四", items: [xhong, xgang, xming, xyang])
Transaction fri = new Transaction(name: "周五", items: [xhong, xgang, xming, xli])

// 创建事务集合
List<Transaction> transactions = [mon, tue, wed, thu, fri]
{% endhighlight %}

那么，很容易得到事务的总数n
{%highlight groovy%}
int n = transactions.size()
{%endhighlight%}

假设有一个2-候选项集
{%highlight groovy%}
List<Item> candidateItems = [xgang, xming]
{%endhighlight%}

我们要用最直接的方式计算其支持度
{%highlight groovy%}
int count = 0
transactions.each {Transaction transaction ->
    List<Item> items = transaction.items
    if (items.containsAll(candidateItems)) {
        count ++
    }
}
double sup = (double)count/n
{%endhighlight%}
我们知道，Java API的List的containsAll(Collection c)的方法实现是遍历c的所有的元素，然后调用List的contains方法。我们假设每个事务的平均项集长度为m，总的事务数量为n，那么我们要判断一个k-候选项集是否为频繁项集的最坏时间复杂度为**O(nmk)**。  

实际上，在创建事务的时候，我们就知道每个Item属于哪些Transaction。假如我们在创建Transaction的时候保留
该信息，那么后面计算支持度的方法就简单得多。  

我们在Item对象中保留该Item属于哪些Transaction
{%highlight groovy%}
class Item {
    def value
    List<String> transactionNames = []
    def void addTransactionName(String name) {
        this.transactionNames.add(name)
    }
}
{%endhighlight%}
Transaction的构造方法如下
{%highlight groovy%}
Transaction(name, List<Item> items) {
    this.name = name
    items.each {Item item ->
        item.addTransactionName(name)
    }
} 
{%endhighlight%}
那么我们计算candidateItems=[xgang, xming]所属于的事务数量的方法就是求两个Item的transactionNames集合的交集的size。
{%highlight groovy%}
xgang.transactionNames.retainAll(xming.transactionNames)
int count = xgang.transactionNames.size()
double sup = (double)count/n
{%endhighlight%}
ArrayList API retainAll的最关键代码是
{%highlight groovy%}
for (; r < size; r++)
    if (c.contains(elementData[r]) == complement)
        elementData[w++] = elementData[r];
{%endhighlight%}
所以retainAll的最坏情况是两个List没有交集，时间复杂度为O(n\*n)，所以计算一个k-候选项集的支持度的最坏时间复杂度为**O(n\*n)**，其中n是事务总数。
























