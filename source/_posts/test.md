---
title: test
date: 2023-03-20 17:51:48
tags:
---

## vue3-pnpm-monorepo
###### 如果没有装pnpm，请先安装： (node.js version>14.9+)
```
$ npm i -g pnpm
```

## 使用
#### 方式一
##### 安装：
```
$ pnpm i
```
如果使用这种方式， 你将一键安装根目录的`node_modules`(项目全局依赖，供packages下所有项目使用)、common下的`node_modules`(common包所需的依赖)，同时会安装packages下所有项目的依赖。
准确地说，使用该方式安装的依赖包括：
* 根目录下的全局依赖（等同于方式二中的`pnpm i -w`）
* 根目录下pnpm-workspace.yaml的workspace下所有的目录的依赖
##### 运行（如运行admore）：
```
$ pnpm admore
```

#### 方式二
##### 安装
安装全局公共依赖，供其他项目使用。根目录执行：
```
$ pnpm i -w
```
接着安装common需要的依赖：
```
$ cd common
$ npm i
```


接着去某个项目的目录，安装该项目的依赖，如安装admore依赖，就去admore目录下npm i：
```
$ cd ../packages/admore
$ npm i
```

##### 运行
运行某项目：如运行admore项目，则在项目根目录执行：
```
$ pnpm admore
```


如需安装全局包（放在根目录package.json下，所有项目皆可使用，项目中`@plutus/common`即是以这种方式安装，供packages下所有项目使用）：
```dotnetcli
pnpm i xx -w
```
（使用 -w 表示把包安装在 root 下，该包会放置在 `root/node_modules` 下。）




## 参考

###### pnpm官网：https://pnpm.io/

###### pnpm+monorepo参考链接：

* https://juejin.cn/post/6964328103447363614
* https://juejin.cn/post/7077168840806760478