---
title: 谈js一道常见闭包问题
excerpt: 闭包、作用域、IIFE、ES6都在里面啦~
date: 2022-3-16 23:12:41
tags: js
categories: 前端
---
### 从一道常考js面试题说起

相信90%js程序员都遇到过这个面试题：

```javascript
for (var i = 0; i < 5; i++) {
  setTimeout(() => {
    console.log(i)
  }, 1000)
}
// 问输出什么
```

如果你回答01234，那就抓紧学学闭包、变量作用域的知识吧。

答案：55555

原因：5个setTimeout都在排队等候，等for循环结束后才会执行。而var定义的i变量暴露给了全部的5个setTimeout，导致5个执行时拿到的都是i=5。

刷过面试题的都知道，这里使用IIFE立即执行函数即可解决闭包造成的问题：

```javascript
for (var i = 0; i < 5; i++) {
  ((n) => {
    setTimeout(() => {
      console.log(n)
    }, 1000)
  })(i)
}
```

或者按值传递，每次都能拿到想要的i：

```javascript
const cout = (n) => {
  setTimeout(() => {
    console.log(n)
  }, 1000)
}
for (var i = 0; i < 5; i++) {
  cout(i)
}
```

同时，绝大部分人都知道最最简单的方法是使用ES6的let代替var，这样每一轮的for都有自己的块级作用域，每个i只在循环的那一轮有效。

那么既然都使用ES6了，那就继续使用起来，promise+async/await，模拟js没有的sleep()这个能忽悠客户打钱的方法吧：

```javascript
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}
const cout = async () => {
  for (var i = 0; i < 5; i++) {
    await sleep(1000)
    console.log(i)
  }
}
cout()
```

这里建议大家都去申请一下Github Copilot，我本来想手动写完sleep方法，谁知我敲出 "const sleep"时候，copilot就自动给我补齐了我想要的。。简直牛逼

### 闭包是什么？

借用[mdn](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures")的描述：

> 一个函数和对其周围状态（ **lexical environment，词法环境** ）的引用捆绑在一起（或者说函数被引用包围），这样的组合就是 **闭包** （ **closure** ）。也就是说，闭包让你可以在一个内层函数中访问到其外层函数的作用域。在 JavaScript 中，每当创建一个函数，闭包就会在函数创建的同时被创建出来。

简单来说，以上面第一个代码为例，上级块级作用域内部变量，因为被下级作用域用到了，所以没有被释放。也就是顶层的var i被每个setTimeout用到了。这样就导致上级块级作用域内的变量，要等到下级作用域执行完后才释放。所以就可以用IIFE、let解决闭包造成的变量未释放问题。

再简单点说就是！：内部函数访问外部函数的变量，不仅可以访问，而且即使外部函数被返回被终结了，也依然可以访问。