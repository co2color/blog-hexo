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

从代码中可以看到，核心是 ComputedRefImpl 这个 class，new ComputedRefImpl 后，执行构造函数，但在 v3.5 后，constructor 内并没有执行响应式挂载的操作，仅仅是进行了两个赋值：

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

为什么我单独拎出来说？我们来看 vue3.4.x 的代码，以最后的 3.4.38 为例子，其 constructor 是这样的：

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
可以看到，v3.4.x中，在构造函数这一步，就挂载了响应。而且还用this.effect.xx，显得挺...丑陋的...

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
