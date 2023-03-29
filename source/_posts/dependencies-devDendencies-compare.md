---
title: dependencies和devDendencies的区别
excerpt: package.json
date: 2022-7-22 02:50:07
tags: 综合
categories: 综合
---
package.json门前有两座山，一个是dependencies，另一个(也)是devDendencies。

你可能会在cs某n这种博客看到类似如下解释：
- dependencies：生产环境必须要的依赖如vue lodash axios等等。
- devDendencies：开发环境用的依赖，如eslint sass，不会被部署到生产环境。

而如果你看多了这些文章介绍，很可能会产生一种错误的认知：把axios放到devDendencies，不会被build进dist（实际上是会的，你在你的项目里想使用第三方发布的npm包axios，这种情况下，你放dependencies或者devDendencies都可以，没什么区别）。
当你在项目中执行npm i的时候，dependencies和devDendencies都会被按照递归树进行安装。
两者真正有区别的地方，我用一个实例来描述：
现在你是一个伟大的开源npm包发布者，你想发布一个叫做"better-axios"的npm包，里面依赖nprogress这个包,用来做进度展示。同时，在这个包的开发过程中，你使用eslint这个包做代码规范检测。
那么按照上述解释来安装，应该使用：
```
npm i nprogress
npm i eslint -D
```
此时的package.json这俩兄弟长这样：
```
  "dependencies": {
    "nprogress": "^0.2.0"
  },
  "devDependencies": {
    "eslint": "^8.23.0"
  }
```
那么当你把这个"better-axios"发布后，其他用户使用`npm i better-axios`安装时，会只下载dependencies里面的nprogress，而不会下载devDependencies里面的eslint。对用户来说，你better-axios里的eslint是你自己开发环境中所依赖的包，用户在自己的项目中是不需要这个包的。所以你的node_moudles里多出来的树是better-axios和nprogress两个包。如果你把eslint放入dependencies里，用户就会install这个eslint。而对用户来说，eslint可能是不需要的。
所以如果你是一个npm包发布者，你就一定要严格对待这俩兄弟。如果你只是开发项目，需要用第三方工具包，就不需要过于区别对待这俩兄弟，不管放哪，都会被build。但比较好的建议是，类似vite eslint放devDendencies，vue lodash dayjs等等放dependencies，虽然对项目打包结果没有任何影响，但这样勉强会规范点（吧）。