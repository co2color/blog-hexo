---
title: 优化vue computed的性能
excerpt: computed计算属性
date: 2024-01-30 22:38
tags: js
categories: 前端
---

> 如果不了解什么是 vue 的 computed，请先阅读[computed 文档](https://vuejs.org/guide/essentials/computed.html)和[watch 文档](https://vuejs.org/guide/essentials/watchers.html)。
> 如果了解使用但不懂实现原理，可以查看[computed 原理](/2023/06/06/vue3-reactivity-computed-storage/)和[watch 原理](/2023/02/22/vue3-reactivity_effect/)。

先看这段代码：

```js
const count = ref(0)
const isEven = computed(() => count.value % 2 === 0)
watchEffect(() => console.log(isEven.value))
count.value = 2
```
watchEffect的callback会先执行一次，打印true，然后碰到count.value = 2，触发isEven的callback，执行2 % 2 ===0 的callback，发现返回结果还是0.

而在vue3.4之前，当isEven还是0时，watchEffect的回调还是会执行。

而vue3.4则优化了这部分逻辑，只有当isEven.value的值发生变化后，才会触发watchEffect的callback。

