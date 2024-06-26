---
title: github pr解读（一）
excerpt: vue3 v3.4.24 使用 transition + keep-alive 导致的 bug
date: 2024-06-25 21:30:41
tags: 综合
categories: 综合
---

> 这是该系列第一期~

### 主题：vue3 v3.4.24 在 transition 中使用 keep-alive 导致的 bug

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

  if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    return (children as VNodeArrayChildren)[0] as VNode
  }

  if (
    shapeFlag & ShapeFlags.SLOTS_CHILDREN &&
    isFunction((children as any).default)
  ) {
    return (children as any).default()
  }
}
```

这里有几个需要解释的：

1. vnode：vue3 的虚拟节点，相当于用 js 描述一个真实的 dom，比如一个 DIV 标签，其 className 是 red，id 是 root，并且该标签有一个点击函数 onClick，如果想渲染这个函数，我们就可以传如下参数,第一个参数是 dom 的类型，p、div 等；第二个参数存储标签的信息:

```js
function func() {}

h("div", {
  id: "root",
  class: ["red"],
  onClick: func,
});
```

2. ShapeFlags
   ShapeFlags 定义在 packages/shared/src/shapeFlags.ts 中，主要是为了用位运算做性能优化。每一个 vnode 都有一个节点类型，而使用位运算来判断节点类型，性能比 a===b 更快。
   创建一个 vnode 参考：packages/runtime-core/src/vnode.ts，createBaseVNode 函数会对 shapeFlag 进行赋值：

```js
// createBaseVNode.ts
if (needFullChildrenNormalization) {
  normalizeChildren(vnode, children)
  // normalize suspense children
  if (__FEATURE_SUSPENSE__ && shapeFlag & ShapeFlags.SUSPENSE) {
    ;(type as typeof SuspenseImpl).normalize(vnode)
  }
} else if (children) {
  // compiled element vnode - if children is passed, only possible types are
  // string or Array.
  vnode.shapeFlag |= isString(children)
    ? ShapeFlags.TEXT_CHILDREN
    : ShapeFlags.ARRAY_CHILDREN
}
```

因此如果你不懂什么是位运算也没关系，只需要知道这个 if 就是为了判断节点类型而存在。在该 if 中，是为了判断当前节点是否是数组类型。

#### 现在回到 getKeepAliveChild 函数中：

getKeepAliveChild 的作用：获取 Transition.keepAlive 中的节点。
而目前的逻辑显然是判断错了，为什么这么说？其实仅看 getKeepAliveChild 函数就能分析出代码意图：

```js
// 如果当前vnode是个数组，那么返回当前vnode的children，这点就很不能让人理解了
if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
  return (children as VNodeArrayChildren)[0] as VNode
}
```

这段代码判断的是该 vnode 的类型，return 的是 vnode.children[0]。如果 vnode.children 长度为 0 ，就会报错。
因此就需要加上 children.length 的判断逻辑：

```js
if (children) {

  if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    return (children as VNodeArrayChildren)[0] as VNode
  }

  if (
    shapeFlag & ShapeFlags.SLOTS_CHILDREN &&
    isFunction((children as any).default)
  ) {
    return (children as any).default()
  }
}
```

现在这段代码就变成了：如果存在 children，那么：如果当前节点是数组节点，就返回 children[0];如果是个 slot，就返回该 slot 的结果。

我们可以看看(该 pr 对应的 issue)[https://github.com/vuejs/core/issues/10771] ，报错都是因为 Cannot read property '0' of null，就是因为下标问题。（生产环境才有，dev 不会）

所以你可以尝试着这样做：1 .找到一个 pr，去看对应的 issue，复现步骤，然后再去研究该 pr 为什么要这样改。

你看这些前端天花板们都会遇到各种各样的 bug，更别提咱了。写 bug 不可怕，关键是要有快速定位&&解决 bug 的能力。加油~
