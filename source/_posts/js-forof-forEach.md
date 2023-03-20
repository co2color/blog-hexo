---
title: js中forEach和for...of在使用async/await时的差异
excerpt: 如题
date: 2022-11-17 22:59:49
tags: js
categories: 前端
---
项目中经常会用到js的forEach，那么它跟传统的for/i++和for/of有什么区别呢？

先从一个简单的代码说起：

```javascript
function getFetch(x) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(x)
    }, 500 * x)
  })
}
function print() {
  const arr = [1, 2, 3]
  arr.forEach(async (item) => {
    const res = await getFetch(item)
    console.log(res)
  })
  console.log('print over')
}
print()
```

执行print，会发现 print over先被执行了。而写这段代码的人，本意大概率是想500ms后打印1，1000ms后打印2，1500ms后打印3，然后forEach结束，打印print over。

这里就涉及到forEach的内部原理了，阅读[forEach源码](https://github.com/v8/v8/blob/main/src/builtins/array-foreach.tq)可以发现，其内部是用callback方式去执行的，就类似于：

```javascript
while(i<len) {
  callback()
}
```

所以当你使用async/await的时候，多个callback整体还是同步在执行，每个async作用的是callback内部函数的顺序（因此await的有效的，只是仅在callback内部有效，我看有一些帖子直接说forEach中await会无效这种说法不够严谨）。

而如果你使用for of，就不会有这种问题：

```javascript
async function print2() {
  const arr = [1, 2, 3]
  for (let item of arr) {
    const res = await getFetch(item)
    console.log(res)
  }
  console.log('print over')
}
```

for of 内部是通过迭代器去遍历的，因此会当作正常流去处理，每次循环，遇到await就等待其执行完，再进行下一次循环。您可以阅读[for/of源码](https://github1s.com/v8/v8/blob/main/src/builtins/array-of.tq)一探究竟。