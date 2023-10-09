---
title: 不喜欢使用element-plus的原因
excerpt: vue3 element-plus
date: 2023-10-09 22:45:26
tags: 前端
categories: 前端
---

vue2 时代，我的主力 ui 框架就是 elementUI，而步入新公司后，公司项目以 vue3+element-plus 为主，因此近来都是频繁地在使用 element-plus 这个 ui 框架。

我想说说为什么我自己的项目会选择使用 arco/antd 而非 element-plus。

#### 使用风格混乱

- el-button:
  以按钮为例，plain\round\circle 分别定义按钮的形状，而我认为一个更好的方式是将其囊括为一个 prop，比如 acro 使用 shape="round||circle"这种方式来定义形状，我认为会更降低用户的心智负担。
  还有 icon 这个 prop，在 element-plus 中，想使用 icon+text 的话，它提供了 icon 这个 prop，可以传入@element-plus/icons-vue 的图标。然而在我看来，这也是一个心智负担：

```html
<script setup lang="ts">
  import { Edit } from '@element-plus/icons-vue'
</script>
<template>
  <el-button type="primary" :icon="Edit" />
</template>
```

为什么这么说呢？*太冗余了。*就像 vue3 非要提供 ref 和 reactive 两个 api 一样多余，
