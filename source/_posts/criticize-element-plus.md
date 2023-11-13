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
  const radio = ref(true)
</script>
<template>
  <el-radio-group v-model="radio">
    <el-radio :label="true">是</el-radio>
    <el-radio :label="false">否</el-radio>
  </el-radio-group>
</template>
```

作为一个前端，一个很明显的事实是：如果要把该字段传给后端，100%是传一个 boolean 类型，而这个组件想设置该值的 prop 却叫做 label...
如果是我，我会这样设置：

```html
<my-radio-group v-model="radio">
  <my-radio :value="true" label="是" />
  <my-radio :value="false" label="否" />
</my-radio-group>
```

或者：

```html
<my-radio-group v-model="radio">
  <my-radio :value="true">是</my-radio>
  <my-radio :value="false">否</my-radio>
</my-radio-group>
```

这样明显更直观。

而 el-select 组件就是这样的：

```html
<el-select v-model="value">
  <el-option
    v-for="item in options"
    :key="item.value"
    :label="item.label"
    :value="item.value"
  />
</el-select>
```

这样就没有心智负担了，value 代表值，label 则是显示给用户看的内容。
而 arco 的 radio 则清爽很多：

```html
<script>
  const options = [
    { label: '是', value: true },
    { label: '否', value: false },
  ]
</script>
<template>
  <a-radio-group v-model="value" :options="options" />
</template>
```

- transfer
  穿梭框组件也是同样的问题，element 的用法是：

```html
<script setup>
  import { ref } from 'vue'

  const generateData = () => {
    const data: Option[] = []
    for (let i = 1; i <= 15; i++) {
      data.push({
        key: i,
        label: `Option ${i}`,
      })
    }
    return data
  }

  const data = ref(generateData())
  const value = ref([])
</script>

<template>
  <el-transfer v-model="value" :data="data" />
</template>
```

这里使用 key 其实没有太多问题，但作为一个同时间使用 transfer、select、radio 组件的人，一会儿 key，一会儿 value，一会儿 label，心智负担实在是太重了....

ps：关于 radio 使用 label 作为值这个事，近期(2023.10 月)element-plus core team 的人说：“收到建议哈，label 和 value 不统一确实会造成使用割裂，也确实是历史包袱的原因。当前大版本应该是不会做出改动了，如果有下个大版本，会优先修改这个问题。”
