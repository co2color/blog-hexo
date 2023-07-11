---
title: 实现@vue/reactivity的effect函数
excerpt: vue3响应式核心
date: 2023-2-22 01:09:09
tags: 源码
categories: 前端
---

> 如果你已经熟练掌握[vue3 effect](https://github.com/vuejs/core/blob/HEAD/packages/reactivity/src/index.ts)的实现，那请不要再继续浪费1秒钟阅读本文章，大神请绕道。
阅读本篇文章，你至少需要具备中级JS水平，并了解Vue3 composition Api以及ES6 Proxy的使用，最好还能再了解一点订阅发布这种设计模式。
本篇文章仅对effect给出简约实现，去除了实际工程中的很多边界情况。但effect必须配合reactive/ref使用，因此会顺便给出这二者的基本响应式实现。


首先来个最终用法：
``` js
// reactive和effect都是从该库引入
const user = reactive({ age: 19 })
// 我们规定effect的cb会先执行
// (不要问为什么会先执行。。你当然也可以写一个自己的effect规定先不执行，触发依赖后再首次执行，这都无所谓，不是重点)
effect(() => {
  console.log(user.age, 'user.age')
})
user.age = 20
```
首先定义响应式数据user，然后执行effect这个函数，该函数传入一个函数(后面简称函数cb，注意这是callback的简写哈。。)作为参数。接着执行age的赋值。
我们都知道vue3中reactive的数据具有响应性，也就是说当你执行`user.age = 20`时，就会触发响应，重新执行cb()。
那么一步步来，我们先不关注reactive，只看effect，当你执行effect()这个函数时，发生了什么？
1. 创建effect函数；
2. effect函数里面new了一个Effect；
3. new完后，cb会执行一次；
4. cb执行过程中，收集cb函数语句的依赖，这里发现收集到了user.age这个依赖（人话：后续user.age改变时，用某种方式让cb再次执行）

#### 1~2：创建effect函数，创建reactiveEffect类，然后new reactiveEffect：
``` js
class reactiveEffect {
  deps = [] // 收集依赖到该数组，因为依赖不一定只有一个(上面代码就user.age一个，因此这种情况deps.length = 1)
  constructor(fn, scheduler?: Function) {
    this._fn = fn
    this.scheduler = scheduler
  }
}

function effect(fn) {
  const eff = new reactiveEffect(fn)
}
```
#### 3.new完后，我们需要让cb立马执行一次。可以发现，effect函数的形参fn被赋值给了reactiveEffect中的_fn，因此我们需要在reactiveEffect中写一个public方法，该方法执行this._fn()，我们把该方法叫做run：
``` js
class reactiveEffect {
  deps = [] // 收集依赖到该数组，因为依赖不一定只有一个(上面代码就user.age一个，因此这种情况deps.length = 1)
  constructor(fn, scheduler?: Function) {
    this._fn = fn
    this.scheduler = scheduler
  }
  run() {
    this._fn()
  }
}
```
然后在effect函数中调用：
``` js
function effect(fn) {
  const eff = new reactiveEffect(fn)
  eff.run()
}
```
至此，effect的cb会立即执行一次。

#### 4.收集/触发依赖；
这里需要简单讲一下reactive。
你首先肯定要写一个reactive函数，这个函数返回一个Proxy: 
``` js
function reactive(raw) {
  return new Proxy(raw, {
    // todo: get and set
  })
}
```
那么这里最重要的就是todo里面的内容了。
我们在实际使用时，比如`const person = reactive({ age: 1 })`，然后调用obj.age，此时就应该触发get，那么我们来实现get：
``` js
function createGetter() {
  return function get(target, key) {
    const res = Reflect.get(target, key)
    // todo
    // track(target, key)
    return res
  }
}

function reactive(raw) {
  return new Proxy(raw, {
    // todo: get and set
    get: createGetter()
  })
}

```
此时调用obj.age，就会触发这个get，返回res给obj.age。但是呢为了实现响应性，让effect的cb被触发，我们需要实现这个track函数，该函数应该放在effect模块中实现，在reactive中引入effect模块的track函数：
``` js
// effect.ts
let activeEffect = null // 存reactiveEffect，此段代码先忽略，下面一段代码实现该变量
const targetMap = new Map() // 存target
export function track(target, key) {
  // target->key->dep
  // 1.存target
  // 2.存key
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map() // 存key
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
  }
}

```
可以发现里面有activeEffect，这是effect模块中的全局变量，在外层定义。在reactiveEffect的run函数中，我们对它进行赋值：
``` js
run() {
activeEffect = this // 赋值
const result = this._fn()
activeEffect = undefined
return result
}
```
这段可能不太好理解，我来点通俗易懂的解释：
执行this._fn()的时候，视角就应该跑去这个_fn的内部，如果这个_fn内部有Proxy.get/set被触发，就会track/trigger；
而如若执行get导致执行track，那么track里面的activeEffect是被赋值给了this的，于是就会执行后面的dep.add(activeEffect)。可能你已经猜到了，这么做就是为了存储activeEffect到dep中，以便后续set的时候执行dep_item.run()，dep数组的每个item都是一个reactiveEffect实例，拥有run方法，因此dep_item.run()就会执行effect中的cb。
那么来实现set：
``` js
function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value)
    // todo
    // trigger(target, key)
    return res
  }
}

function reactive(raw) {
  return new Proxy(raw, {
    // todo: get and set
    get: createGetter(),
    set: createSetter()
  })
}
```
相应的，我们来实现trigger，trigger会执行effect的cb：
``` js
export function trigger(target, key) {
  // 1.找到target
  // 2.找到key
  // 3.找到dep
  // 4.执行dep
  const depsMap = targetMap.get(target)
  const dep = depsMap.get(key)
  triggerEffects(dep)
}
export function triggerEffects(dep) {
  // 执行收集到的所有的 effect 的 run 方法
  for (const effect of dep) {
    effect.run()
  }
}
```
找到dep，然后执行所有dep的item(即effect)即可。

用demo总结：
对于这段代码：
``` js
const user = reactive({ age: 19 })
let double
effect(() => {
  console.log(user.age, 'user.age')
})
user.age = 20
```
我的理解：
1.首先执行effect()这个函数
2.eff.run()执行上面effect()括号内的callback，
  此时currentEffect就被赋值给了这个callback，
  后面set的时候再触发该callback，
  相当于又执行了effect()括号内的callback
 3.执行callback的时候发现user.age被访问(被proxy劫持，触发get)了，于是执行track()
 4.执行track()的时候发现currentEffect存在，
   于是dep.add，即把callback添加到dep中，用于后面的trigger执行该callback
5. 执行user.age = 20的时候，触发set，于是执行trigger()
6. 执行trigger()的时候，遍历dep，执行dep中的callback，即effect()括号内的callback，最终实现了类似vue的响应性

------------------------------------
完整代码：[https://github.com/co2color/easy-vue3/blob/main/src/reactivity/effect.ts](https://github.com/co2color/easy-vue3/blob/main/src/reactivity/effect.ts)
