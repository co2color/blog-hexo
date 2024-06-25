---
title: github开源项目pr解读（一）
excerpt: 通过pr来提升自我水平~
date: 2024-06-25 21:30:41
tags: 综合
categories: 综合
---

### 第一个：vue3 v3.4.24 使用 keep-alive 导致的 bug

复现代码：

```html
<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

  <router-view v-slot="{ Component, route }">
    <transition name="fade" mode="out-in">
      <keep-alive>
        <component :is="Component" :key="route.fullPath" />
      </keep-alive>
    </transition>
  </router-view>
</template>
```

修复 pr 请看：[修复 pr](https://github.com/vuejs/core/pull/10772/files)

我们看 3.4.24[packages/runtime-core/src/components/BaseTransition.ts](https://github1s.com/vuejs/core/blob/v3.4.24/packages/runtime-core/src/components/BaseTransition.ts#L461-L483) 的 getKeepAliveChild 函数，关键代码如下：

```js
function getKeepAliveChild(vnode: VNode): VNode | undefined {

  const { shapeFlag, children } = vnode

  // 导致bug的部分
  if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    return (children as VNodeArrayChildren)[0] as VNode
  }
}
```

这里有几个需要解释的：

1. vnode：vue3 的虚拟节点，相当于用 js 描述一个真实的 dom，比如一个 p 标签，其 className 是 p-name，并且该标签有一个点击函数 onclick，那么如果想渲染这个函数，我们就可以传如下参数,第一个参数是 dom 的类型，p、div 等；第二个参数存储标签的信息:

```js
function func() {}

h("div", {
  id: "root",
  class: ["red"],
  onClick: func,
});
```

2. ShapeFlags
   as
