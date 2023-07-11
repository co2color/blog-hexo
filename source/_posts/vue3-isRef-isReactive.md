---
title: 实现vue3中的isRef/isReactive/isReadonly
excerpt: 判断一个val是否是相关定义的类型
date: 2023-2-14 01:05:56
tags: 源码
categories: 前端
---
> 读该文章之前，你需要先了解[Proxy](https://es6.ruanyifeng.com/#docs/proxy)相关的知识。


最近读vue3源码，isRef使用了一个其实非常非常简单的办法。
比如下面这段代码:
``` js
class Ref {
  public __v_isRef = true
  // 接收参数忽略
}
function ref(val) {
 return new Ref()
}
```
若你想判断obj是否是ref，其实很简单：
``` js
function isRef(value) {
  return !!value.__v_isRef
}
const obj = ref(18)
isRef(obj) // true
isRef({}) // false
```
但isReactive和isReadonly不太一样。他们俩会先设定好一个map：
``` js
export const ReactiveFlags = {
  IS_REACTIVE: '__v_isReactive',
  IS_READONLY: '__v_isReadonly',
}
function isReactive(raw) {
  return !!raw[ReactiveFlags.IS_REACTIVE]
}
export function isReadonly(raw) {
  return !!raw[ReactiveFlags.IS_READONLY]
}
```
然后，如果你调用isReactive，就会去触发get：
``` js
const obj = reactive({
  age: 18
})
isReactive(obj) // isReactive函数内部执行return !!obj.__v_isReactive，此时会触发get
```
接着，在Proxy get里面，单独对该key做一个判断，如果访问的是该key，就return true：
``` js
// 这里暂不考虑是readonly的情况，否则if中需要再加上相关判断条件
if (key === ReactiveFlags.IS_REACTIVE) {
  return true
}
```
这里get返回true，因此isReactive返回true。（并且Proxy get后续代码不需要执行。也就是说，如果是访问了__v_isReactive这个字段，直接return true）
``` js
const obj = reactive({
  age: 18
})
isReactive(obj) // true
```
说到这里，再来一个computed的简易原理：
``` js
class ComputedRefImpl {
  private getter: Function
  constructor(getter) {
    this.getter = getter
  }
  get value() {
    return this.getter()
  }
}

export function computed(getter: Function) {
  const computedRef = new ComputedRefImpl(getter)
  return computedRef
}

const user = reactive({
  age: 1,
})
const computedAge = computed(() => {
  return user.age
})
```
computed里面的回调函数会返回一个值，然后在ComputedRefImpl类中get value返回该函数的值，最终，当你使用computedAge.value的时候就会去触发get，获取该callback的返回值。


