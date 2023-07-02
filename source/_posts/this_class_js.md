---
title: 吐槽吐槽js中this、class
excerpt: confusing
date: 2023-07-02 01:03:18
tags: js
categories: js
---
> 关于在JavaScript中使用this关键字和class关键字的一些吐槽

我觉得使用过js的程序员基本都不怎么喜欢this这个东西，目前我在工程中几乎已经不使用this了。我认为this就是**缝合怪设计**。

一个正常的前端程序员，几乎只有在需要面试时才会去重新记忆例如「多种指向」，比如[寄生组合式继承](https://co2color.netlify.app/2023/03/09/js_inherit/)等等内容。如果某人跟你battle这些，你可以直接反问他：“为什么老子学jvav py cpp php等等的语言都不需要考虑你说的这些莫名其妙的东西？这玩意不应该只跟class一起出现么，它怎么敢出现在普通函数中的啊？”
又比如，关于js中的隐式转换，我觉得作为一个合格的前端工程师还是需要掌握的，但也仅此而已，这都是js的糟粕，学习这些东西，除了应对老旧工程项目和面试以外，没有任何意义。否则脱离了js你会发现你琢磨的这些东西都是在白费劲，是独一份。谁跟你谈隐式转换的原理，那希望你能停止和这个人的谈话，把时间拿去玩游戏睡觉都行。

按照我掌握的八卦，this的设计就是一个坑，是历史包袱导致的，大致可以概括为「产品经理要求的需求和程序员对于某些点的偏执」。到这里你应该把这件事当作类似于娱乐圈吃瓜的事情看待，js祖师爷要抄jvav，又要面向object而不是仅限于class，函数还得是一等公民，那咋办嘛....往函数里面丢this不就解决了.....

而我上面说，我几乎不使用this了，但在使用class时除外，只要你保证自己的代码是es6+语法的，那么其实并不会在class之外的地方用到this。

不过我一直觉得继承就是个shit，是编译技术落后的产物，以前的软件不怎么复杂，他们就觉得继承好像没什么，还挺方便...但后来软件越来越复杂，继承带来的强耦合太要命了，所以我其实一直都很不喜欢用class（但dom基本还是用的继承，so继承在js里始终是需要的）使用class还会有各种bind问题，一不注意你的this.xxx就变成undefined了。绝大部分大学在大一大二的时候都会开设比如c这种面向过程语言用来入门编程，然后再开jvav用来学习oop。我见过在vue2.x+ts的项目里的每个vue页面都使用class.....在我看来简直窒息....所以很多前端程序员在工作中，上来就喜欢写class....很多都是被jvav等等影响了。其实最基础的工厂函数就能搞定啊，比如项目封装网络请求，如果用oop class实现：
``` js
class HttpClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
    this.getUser = this.getUser.bind(this)
  }
  getUser(id) {
    return axios.get(`${this.baseUrl}/users/${id}`)
  }
}
const httpClient = new HttpClient('host/api')
const getUser = httpClient.getUser
getUser(123)

```
上面可以看出来**在js中**class的几个问题：
- bind关键字，需要使用this.getUser.bind(this)赋值给this.getUser，繁琐；
- 在class内部的getUser方法中使用baseUrl时需要用this去获取，繁琐；
- 需要使用new关键字定义httpClient这个实例，繁琐死了...

而使用工厂函数：
``` js
function httpClientFactory(baseUrl) {
  return {
    baseUrl: baseUrl,
    getUser: (id) => {
      return axios.get(`${baseUrl}/users/${id}`)
    }
  }
}
const httpClient = httpClientFactory('host/api')
const getUser = httpClient.getUser
getUser(123)
```
简洁多了。

而如若你就是想使用class，那也可以，因为class具有更高的声明性和静态可分析性，同时在现代引擎里也有更好的优化。另外，解决this的最好方法并不是bind，而是箭头函数。不推荐class并不是因为oop本身的问题，而是js中的this指向混乱的问题，得辩证看待。而我觉得继承这个设计不好，并不是js的问题，而是oop的问题......当年软件不复杂，硬件能力和编译技术都有限，用继承无可厚非，不能怪他们。可现在，起码2023年的内存完全是白菜价，我最近看16g ddr5才200块...加之编译技术也更强了，所以目前的新语言基本都不使用继承了。




