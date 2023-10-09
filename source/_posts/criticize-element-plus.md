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

为什么这么说呢？*太冗余了。*设计者是想把其作为一个便捷功能植入 button 里，但实际上真的不应该面面俱到，就像 vue 被批 api 太多，不像在写 js 一样，我认为 icon 这种 prop 不应该存在，你可以提供一个#icon 的 slot 来处理，或者用户其实能在 content 里自行处理。你加个 icon 的 prop，还只能用你自己的 icons 组件，无形之中又加了一层心智负担。

- el-radio 和 el-select:
  这俩组件十分让人迷惑困扰和厌恶。
  以下是 el-radio 的使用方式：

```html
<script setup lang="ts">
  import { ref } from 'vue'
  const radio = ref('1')
</script>
<template>
  <el-radio-group v-model="radio">
    <el-radio label="1">Option 1</el-radio>
    <el-radio label="2">Option 2</el-radio>
  </el-radio-group>
</template>
```
