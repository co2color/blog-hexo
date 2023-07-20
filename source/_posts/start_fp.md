---
title: Functional Programming之js中的闭包
excerpt: fp/closure/javascript
date: 2023-07-03 02:05:41
tags: 综合
categories: 综合
---
> fp 即 函数式编程，本文都用fp代替 函数式编程。

作为一名JavaScript工程师，随着经验的增长，我发现js中的面向对象超令人困惑，比如原型和继承机制如何工作，比如this的使用，bind this时遇到的各种困惑的bug等等。而fp会更顺手、更安全、更简单去调试，构建项目也更好维护。那么我就讲讲自己对fp的理解。

#### 理解fp

在fp开发中，一切都要函数化，所以我们的思路就应该变成 考虑程序的输入输出数据流，而不是考虑对象如何交互或控制、一步步从上到下的实现。

比如，非fp打印字符串：
``` js
const myName = 'cococolor'
console.log('Hi,' + myName)
```
而fp会这么写：
``` js
function getName(yourName) {
  return 'Hi,' + yourName
}
getName('cococolor')
```
你可能觉得，这不就是包裹了一层func吗？但函数式编程中，函数其实并不是指JavaScript中的function关键字定义个所谓的“方法”，而是数学上的函数，比如y=x、y=sin(x)，相当于是一种**映射关系。**，并且只能有**一个输入和一个输出。**

所以你如果看到这里了，你会发现，fp的核心点之一就是尽可能纯粹。何为纯粹呢？**同一个输入永远对应相同的输出。**所以像下面的代码就不是fp：
``` js
let name = 'coco'
function getLastName(lastName) {
  return 'Hi,' + name + lastName
}
getLastName('color') // Hi,cococolor
```
我是一个有洁癖的人，不变的量只用const，因此这里name使用let定义，你就应该能够猜到为什么这段代码不属于fp了：**同一个输入，因为name可能会变化，因此其输出结果不一定相同。**

再讲几点：

- 在fp中，你完全用不到this了，函数内的变量都是内部变量，直接使用即可。可以参考我[这篇文章](https://co2color.netlify.app/2023/07/02/this_class_js/)对js中this的吐槽。

- webpack5一大更新就是*better tree-sharking*，这是一个性能优化点，而你会发现，如果使用fp，做tree-sharking就会变得更轻松，只要一个函数从头到尾都没有被调用过，就应该被剔除掉。

- vue中的computed一直强调不应该有*副作用*，而fp也如此，你不应该在函数内部去和外部的全局变量进行互动，函数功能完全应该独立，函数里面的表达式都是为了最终返回一个东西，不应该有其他任何行为。比如js中的arr.slice是不影响原数组的，而splice是会影响的，因此我们可以称splice是一个不纯洁的孩子。

#### 闭包
之前写过一篇闭包相关的[文章](https://co2color.netlify.app/2022/03/16/js-closure/)，当时觉得自己讲得挺好的，但现在又有了新的认识。
现有一个需求：实现2个数(即2个变量)相加。
普通写法:
``` js
function add(a, b) {
  return a + b
}
add(1, 2) // output 3
```
但这很明显不是fp，因为上面的add函数有2个参数。

而用fp实现：
``` js
function add(a) {
    return b => a + b
}
const sum = add(1)
sum(2) // output 3
```
看这段代码，sum其实属于add的某种“副本”，实现上需要有一块存储区域来**记**“sum中的a = 1”这个状态，**这个状态对外不可见，所以叫它闭包(Closure)。**
再通俗一点来说就是，因为sum要记住自己定义的时候 a的值为1，所以实现时，**b => a + b和a = 1**会捆绑在一起，**这样的组合就是闭包。**
下面是一个fp中的闭包实际用例：
``` js
function memoize(arg) {
  const cache = {}
  return (name) => {
    cache[name] = arg + '--' + name
    return cache
  }
}
const memoized = memoize('hello')
memoized('world') // {world: 'hello--world'}
memoized('cococolor') // {world: 'hello--world', cococolor: 'hello--cococolor'}
```
在这个例子中，闭包允许我们创建一个缓存对象 cache，并在不暴露给外部的情况下，**持久地保存其状态。**由于闭包的存在，每次调用memoize函数时，**都会创建一个独立的cache对象，并将其保存在闭包中**。每次调用memoized函数时，都会更新cache对象，并保留之前的结果。

所以，可以说memoized函数和arg是捆绑在一起的，每个memoized函数实例都与一个特定的arg值相关联。而memoized函数和cache也是捆绑在一起的，每个memoized函数实例都有自己的独立的cache对象。
这种捆绑关系使得每个memoized函数实例都具有自己的状态，并且可以在闭包中持久地保存和访问这些状态，而这种状态对外是不可见的，是保存在memoized函数内部的，所以用“闭”和“包”这俩字的组合 「闭包」 来称呼，倒也是蛮形象的。
