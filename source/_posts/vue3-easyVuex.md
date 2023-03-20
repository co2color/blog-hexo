---
title: vue3代替vuex的简单方案
excerpt: 当然，你直接使用pinia也ok
date: 2022-4-2 19:32:10
tags: js
categories: 前端
---
vuex4我还没用过，但社区都说不行不行。
而vue3实现了一套响应性api可以直接用，那么试着自己来实现一个简单全局状态管理。
### 创建/store/useUserStore.js

``` javascript
import { reactive, readonly } from 'vue'
import { apiLogin } from '@/api/user' // 登录示例，用你自己的网络请求接口
const initState = reactive({
  name: 'co2color',
  isLogin: false
})

const state = readonly(initState) //--避免外部直接更改state值

export const actions = {
  async useLogin(name: string, password: string) {
    const res = await apiLogin(name, password)
    initState.isLogin = res.loginStatus
    initState.name = name
  }
}
export const useUserStore = () => ({
  state,
  actions
})

```
使用：
``` javascript
<script setup lang='ts'>
import { useUserStore } from '@/store'
const store = useUserStore()
console.log(store.state)
setTimeout(() => {
  store.actions.useLogin('handsome co2color', '123456')
}, 1000)
console.log(store.state)
</script>

<template>
  <h1>{{ store.state }}</h1>
</template>

```
读者可以自己试试，放两同级组件<Child1>和<Child2>，在Child1调用useLogin()，Child2的状态也会跟着改变。
至此，用vue3自定义hooks实现了简单的全局数据共享和状态管理。

github：[https://github.com/co2color/vue3-state-management](https://github.com/co2color/vue3-state-management)

ps：vuex4不行，但pinia行（yyx说的）。个人认为我实现的这个，可以适用于很小型的项目。但是目前中型以上项目建议ts+pinia。我看了看pinia，摒弃了mutation，同步异步都放actions，我觉得很棒，不像vue2使用vuex那般，同步mutation，异步action，虽然这里的异步放action只是一个概念性的东西，里面其实怎么写都可以，只要确保同步必须用mutation就行了。这样做仅仅是为了方便devtools追踪状态，至于你写action请求ajax之类的导致异步竞态问题，那是使用者的问题，跟vuex无关哈哈哈哈(也是yyx说的，就是这么强势)。但总体而言。这样做肯定增加了使用者的心智负担。
所以我个人认为pinia还是很棒棒的~
pinia官网：[https://pinia.vuejs.org/](https://pinia.vuejs.org)
3.24更新：尤大3.20掘金直播里说pinia就是vuex5，所以放心大胆用吧~