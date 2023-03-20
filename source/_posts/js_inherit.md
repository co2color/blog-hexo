---
title: js继承
excerpt: (⊙﹏⊙)
date: 2023-3-9 23:16:29
tags: js
categories: 前端
---

寄生组合式继承:

```js
function Parent() {}
Parent.prototype.a = 1

function Child() {
  Parent.call(this)
}

const obj = {}
obj.__proto__ = Parent.prototype
// 用assign把以前prototype的也都放进来，否则child在继承Parent之前定义的原型方法就没了
child.prototype = Object.assign(obj, child.prototype)
// 上面三个可以合成为下面一行：
// Child.prototype = Object.assign(Object.create(parent.prototype), child.prototype)
// 可以把Object.create(parent.prototype)看成是return了一个 { __proto__ :parent.prototype }的对象
// 那么其实就是给child的实例比如 const c = new Child()，转变成：
// c.__proto__ = { __proto__ :parent.prototype }
// 然后.运算继续调用里面的key，转变成：
// c.__proto__.__proto__ = parent.prototype
// 这时候c.__proto__就用了Child的prototype的内容，再一次__proto__就是Parent的prototype的内容啦~
Child.prototype.constructor = Child
```
