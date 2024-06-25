---
title: 分享几个github的pr
excerpt: 通过pr来提升自我水平~
date: 2024-06-25 21:30:41
tags: 综合
categories: 综合
---

#### vue3_v3.4.24 使用 keep-alive 导致的 bug

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
