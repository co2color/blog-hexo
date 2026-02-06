---
title: AI时代之人类程序员的生存与心理观察报告（2025年）
excerpt: 前端娱乐圈个人年度总结
date: 2026-02-04 23:00:00
tags: 综合
categories: 综合
---

> 引言：2025年末，GPT5.2、Gemini3 Pro、Claude Code等对程序员产生了巨大冲击。我相信现在大部分程序员应该都认同一句话：AI写的代码比咱强多了。（这里最后一句话，从冒号后面开始是antigravity的tab生成的，你看它多狂妄！）

## 一、2025年前端最佳实践

### 1. 公共生态

pnpm monorepo + tailwindcss + typescript + eslint 绝对是所有合格项目必备项。

### 2. 框架

#### 2.1 vue生态

Vue3 + vite + pinia +antd/element

vue3.5的script setup已然是最佳实践。配合element/antd/arco组件库都可以。
同时，本年发生了一件很.....的事情：vercel把nuxt收购了....当然了我个人认为，nuxt之后应该会更好，因为有更雄厚的资金支持了。vercel想打造的是全平台生态，而不单单只是nextjs。

#### 2.2 react生态

Next.js + zustand + shadcn/ui

react目前首选vercel的nextjs，过去的create-react-app已经彻底被淘汰了。
在ui框架层面，shadcn/ui也是杀疯了，新项目首选shadcn/ui而不是ant这种大而全的组件库。当然了，ant在维护老项目上依然是主流。


### 3. 构建工具
要不说前端娱乐圈呢，构建工具这两年实在让人眼花缭乱。我们一一分析：

#### 3.1 Webpack
新项目肯定是不用webpack这个上古产物了。承认你的丰功伟绩，但你该退休了。

#### 3.2 Turbopack
webpack亲爹加入vercel后主导，深度绑定 Next.js。虽然号称通用，但目前脱离 Next.js 独立使用的文档和案例非常少。

#### 3.3 esbuild
是个编译器，Go写的，目前我感觉就是给Vite的dev环境用的。这也暴露出vite的一个缺点：生成/开发环境不一致，容易出现未知问题。为什么vite在npm run dev的时候那么快？就是因为用了esbuild,利用浏览器原生 ESM 加载文件，实现秒级启动。

#### 3.4 Vite
使用vue3项目的人基本都绑定vite。但其实vite是个缝合怪，在2025年，我们只需要知道：尤大目前的重心就是解决vite生产/开发环境不一致的问题，Vite 未来将把底层的 esbuild 和 Rollup 全部替换为 Rolldown。

#### 3.5 Rollup
在我心目中，依然是开发 npm 包/组件库的最佳标准。专注于 ESM（ES Modules），生成的代码非常干净、扁平，Tree-shaking（摇树优化）效果最好。

#### 3.6 Rspack
核心卖点是"高性能的 Webpack"，是Webpack 的替代品。它在构建速度上进行了优化，采用了 Rust 语言编写，并利用多核并行处理来加速构建过程。此外，Rspack 还提供了与 Webpack 相似的 API 和插件系统，使得从 Webpack 迁移到 Rspack 相对容易。

#### 3.7 Rolldown
Vite 的未来核心，使用rust，非常快。

总结：如果你搭建vue/react 的spa脚手架，无脑vite即可。如果你要实现一个类似lodash的js工具函数库，或者类似umeng等js埋点sdk，那么rollup依然是你的最佳选择。