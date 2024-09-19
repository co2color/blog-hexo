---
title: github pr解读（二）
excerpt: vue3 v3.5.0 computed参数的oldvalue失效bug
date: 2024-09-12 22:12:43
tags: 综合
categories: 综合
---

> 这是该系列第二期~

### 主题：vue3 v3.5.0 computed 参数的 oldvalue 失效 bug

复现代码：

```html
<template>
  <p>Counter {{ counter }}</p>
  <p>previous: {{ previous || 'undefined' }}</p>
  <p>counterComputed: {{ counterComputed }}</p>
  <button @click="counter++">Increase</button>
</template>

<script setup>
  import { ref, computed } from "vue";

  const counter = ref(0);
  const previous = ref(0);
  const counterComputed = computed((_previous) => {
    previous.value = _previous;
    console.log(_previous);
    return counter.value;
  });
</script>
```

Vue SFC Playground 地址：[点击此处](https://play.vuejs.org/#__PROD__eNp9UktPwzAM/itRLtvE1CEBF+gqHuIAB0DAsRIqnTcCaRLlUSZ1/e/Y7VLGBNya72H7s9vwC2OSOgA/5amHysjCQ5YrxlKTXemgPFjWNKzcfrZtOjORNxZqoYM7JUV8sM2GjYJawFIoWIx+OrZlrnRlgodFZ9zDdg2vwXut2HkpRfkxz/lWenCQ8+xGlRYKB+msV6Ejne0kwKcrrTCeOfCBCorKaOtZwywsp9g29mNLqys2wiWMyFZq5fwQeE7q8eEk4kPMfWI/xnzoMB6/RNeEzTPWULaIJHUhA6B60BBLJbWEROrVjpkYi2Gsit16d67ayRnF7wNnfMq9wxJLsUrenVZ4264nLbAyQoK9N15gi5zjBYghrpBSf952mLcBphEv36D8+AV/d2vCcv5gwYGtIecD5wu7At/T1093sMbvgaz0IkhU/0M+AsYPNGMvu8QfCsfe0XXT3nQXFWr17K7XHpSLoWhQUradPud4WzrMX9G/xz1KjjsfrhS3+FKDpZq4wKPkJDnk7RcyGxhL)

使用 vue3.5.0 可以发现，\_previous 一直是 undefined，这说明 callback 返回的参数有问题。

我们先来看看 computed 函数的简单实现，可以看[这篇文章](https://co2color.netlify.app/2023/06/06/vue3-reactivity-computed-storage/)。可以看出来，computed 本质上就是一个函数，相当于

```js
function computed(callback) {
  // effect
  // ... do something else
  return callback();
}
```

再来看看 v3.5.0 的实现，详情看[这里](https://github1s.com/vuejs/core/blob/v3.5.0/packages/reactivity/src/computed.ts)。

从代码中可以看到，核心是 ComputedRefImpl 这个 class，new ComputedRefImpl 后，执行构造函数，但在 v3.5 后，constructor 内并没有执行响应式挂载的操作，仅仅是进行了赋值：

```js
// v3.5.x
constructor(
  public fn: ComputedGetter<T>,
  private readonly setter: ComputedSetter<T> | undefined,
  isSSR: boolean,
) {
  this[ReactiveFlags.IS_READONLY] = !setter
  this.isSSR = isSSR
}
```
注意public fn 等同于 this.fn = fn， 相当于this上面是挂载了fn的，不要误认为fn没有被赋值。如果你不懂typescript构造函数中的public的用法，可以看[这里](https://ts.xcatliu.com/advanced/class.html#%E5%8F%82%E6%95%B0%E5%B1%9E%E6%80%A7) 。

为什么我单独把constructor拎出来说？我们来看 vue3.4.x 的代码，以最后的 3.4.38 为例子，其 constructor 是这样的：

```js
// v3.4.38
  constructor(
    private getter: ComputedGetter<T>,
    private readonly _setter: ComputedSetter<T>,
    isReadonly: boolean,
    isSSR: boolean,
  ) {
    this.effect = new ReactiveEffect(
      () => getter(this._value),
      () =>
        triggerRefValue(
          this,
          this.effect._dirtyLevel === DirtyLevels.MaybeDirty_ComputedSideEffect
            ? DirtyLevels.MaybeDirty_ComputedSideEffect
            : DirtyLevels.MaybeDirty,
        ),
    )
    this.effect.computed = this
    this.effect.active = this._cacheable = !isSSR
    this[ReactiveFlags.IS_READONLY] = isReadonly
  }
```
可以看到，v3.4.x中，在构造函数这一步就挂载了响应。（this.effect.xx，显得挺...丑陋的...

而在v3.5.0之后，就会在get value() {}时才进行挂载，这样其实页面初始性能也会更好，在我看来算得上是一个性能优化点。

回到文章主旨来，我们来看get方法：
``` js
  get value(): T {
    const link = __DEV__
      ? this.dep.track({
          target: this,
          type: TrackOpTypes.GET,
          key: 'value',
        })
      : this.dep.track()
    refreshComputed(this)
    // sync version after evaluation
    if (link) {
      link.version = this.dep.version
    }
    return this._value
  }
  ```
  this.dep.track()是响应式监听ref/reactive值的变动，这里不多说，仔细想想，监听变动，并不会涉及callback漏参数问题。
  
  我们来看很重要的refreshComputed函数，定义在effect.ts中（之前的isdirty都是在get value中进行的，现在都放到了effect那边，应该是希望能够更加公用化）。

  我们来找到我们最上面例子中漏掉的参数previous：
  从/packages/reactivity/src/computed.ts的computed函数可以看到，传入进来的callback的参数名字叫做getterOrOptions; 其次被isFunction(getterOrOptions)执行后，我们的callback变成了getter，最终传给ComputedRefImpl，所以ComputedRefImpl的构造函数的第一个参数fn就是我们的callback函数。

  那么我们就应该找到是什么时候执行我们传入的callback（fn）的：
  从refreshComputed函数中可以看到有.fn的影子，但我们看v3.5.0的代码，函数是这样的：
  ``` js
   try {
    prepareDeps(computed)
    const value = computed.fn()
    if (dep.version === 0 || hasChanged(value, computed._value)) {
      computed._value = value
      dep.version++
    }
  }
  ```
  这里的computed就是我们上面的this，this就是指ComputedRefImpl内部的this（就相当于ComputedRefImpl内部进行this.fn），所以computed.fn就是在执行我们传入的callback函数。可以看到，这个函数并没有参数，所以我们上面的previous一直是undefined。

所以这里应该给fn传入一个参数，从后面几行代码可以看出，如果有改变，就重新赋值_value，说明在const value = computed.fn()这一行的时候，_value还是旧值，所以我们就可以直接把这个旧值传入进来：
  ``` js
  const value = computed.fn(computed._value)
  ```

  注意，这是v3.4.38->v3.5.0改出来的bug，在v3.5.0和v3.5.1中存在，于V3.5.2被修复，这里是[修复的pr地址](https://github.com/vuejs/core/pull/11813/files)。


我们来看看为什么v3.4.38是正常的：
从3.4.38源码中可以看到，我们传入的callback在ComputedRefImpl的constructor中叫做getter，然后做了这一步：
``` js
    this.effect = new ReactiveEffect(
      () => getter(this._value),
      () =>
        triggerRefValue(
          this,
          this.effect._dirtyLevel === DirtyLevels.MaybeDirty_ComputedSideEffect
            ? DirtyLevels.MaybeDirty_ComputedSideEffect
            : DirtyLevels.MaybeDirty,
        ),
    )
```
getter(this._value) 就会把之前的旧值返回，所以3.4是正常的。

你看，这只是一个很简单的pr，就改动一个传参，但是你从中可以学到的：
1. 顺着computed函数一步一步捋清楚源码的调用顺序，你也能发现这个bug的解决方式；
2. 比对为什么之前的可以，而之后的不行？哈哈哈这一点说明vue core team没有做详细的单测，所以在上面的pr中，他们也补加了这个case。
3. 从3.4和3.5，我们可以学习到代码重构的方式，yyx称之为【Vue 响应式系统又经历了一次重构】，其结果是【，继续优化性能，内存使用率降低了 56%】。 比如之前computed的脏值判断都是在computed的get完成的，现在抽离出来了。比如set 响应性之前是在构造函数中进行的，如果你页面定义了一个computed但没有立即使用，那么就会有不必要的性能浪费。初始化的时候项目加载都挺大的，这一点完全可以在使用时(.value)再去进行。



