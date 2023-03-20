---
title: vue3中hooks的使用
excerpt: 以element/e-plus中el-button的写法不同作为参照
date: 2022-02-09 23:12:44
tags: js
categories: 前端
---
提到vue3，谈得最多的就是Composition api，比起vue2的options api，官方给出了一张直观对比图：
![Description](https://vuejs.org/assets/composition-api-after.e3f2c350.png)
首先我想提一嘴，很多文章会说vue3是从类编程转变成了函数式编程，但官方文档说道：
>Despite an API style based on function composition, Composition API is NOT functional programming. Composition API is based on Vue's mutable, fine-grained reactivity paradigm, whereas functional programming emphasizes immutability.
虽然这套 API 的风格是基于函数的组合，但组合式 API 并不是函数式编程。组合式 API 是以 Vue 中数据可变的、细粒度的响应性系统为基础的，而函数式编程更强调数据不可变。

我倒也不是想钻牛角尖，只是我个人也还是会和很多文章的作者观点一致，或者说最起码的，我觉得我写vue3确实在靠近函数式编程。（高中那会我私信问了一个知乎大佬，最适合入门的语言是什么，他说Haskell，但直到现在，我都还没能领悟函数式编程的精髓，因为一直在写oop语言。只知道函数式编程大概说的是，把各种功能细分到极致balabala）

### hooks

其实我最初使用capi的时候，各种ref reactive和watch computed methods都定义到一堆，写得乱七八糟，甚至一度觉得，把ref、reactive当作vdata，其他定义的methods当作vmethods，那么我用options api不是更整齐么....直到我了解了hooks（如果你使用react，想必早就会了吧，尽情嘲笑我们vuer吧2333），我才发现，vue3是真TMD爽！

笔者用element框架中的button按钮组件为例，来看看二者的差异，源码：

### [vue2 el-button](https://github.com/ElemeFE/element/blob/HEAD/packages/button/src/button.vue)
2的源码其实很简单，复杂度几乎全在于初始阶段的需求分析，只要把所有需求都罗列出来，挨个实现即可。代码层面就是vue2最基础的props父传子，computed去计算按钮的size和disabled，methods里面就一个click事件，然后emit回调给父组件响应此事件。

### [vue3 el-button](https://github.com/element-plus/element-plus/blob/dev/packages/components/button/src/button.vue)
代码太长就不放了，可以点链接进去看。
粗看3的源码实现，你会发现，映入眼帘的就是**hooks**。
我对hooks的理解：其本质是一个函数，封装你要使用的Composition api，类似于vue2.x中的Mixin，可以更好地抽离逻辑和复用代码。
比如el-button中用到的useDisabled，就是一个复用性很强的例子。在vue2的el-button中，button的disabled状态是写在computed里的。而看vue3中的el-button实现：
``` javascript
export const useDisabled = (fallback?: MaybeRef<boolean | undefined>) => {
  const disabled = useProp<boolean>('disabled')
  const form = inject(formContextKey, undefined)
  return computed(
    () => disabled.value || unref(fallback) || form?.disabled || false
  )
}
```
其实上面的代码看着还是蛮费劲的（仅仅是想看看button的实现，翻出useDisabled的实现后，还得看import进来的MaybeRef、useProp等等是什么东西），但总而言之，这个useDisabled就是一个动态控制按钮是否可用的hooks。
我尝试写一个最简单基础的hooks——useTitle，用来改变页面title：
``` javascript
import { ref, watch } from 'vue'
export const useTitle = (title = 'default title') => {
  const _title = ref(title)
  watch(_title, (val) => {
    document.title = val
  })
  return _title
}
```
使用方式：
``` javascript
import { useTitle } from './hooks'
const _title= useTitle('text')
setTimeout(() => {
  _title.value = 'other text'
}, 1000)
```
emmmm我觉得这个useTitle真没什么可说的，属于一看就豁然开朗的hooks初级入门demo。
我没怎么学过react，就简单看过react官网的井字棋的实现。我认为vue3的ref就类似于React.useState，只是没有遵守hooks中的以use开头的命名规范（不过想想，这是我vue3的api，遵守个der啊）。
hooks相比mixin，更能悉知复用代码的来源。我特别能体会被mixin支配过的恐惧，尤其是接盘一个陌生项目，每个vue页面引入三四个mixin.js，其中的data和methods完全看不出从哪来的。所以我觉得如果你使用了vue3，你一定要用上vue3.2+setup语法糖+ts可选+hooks。