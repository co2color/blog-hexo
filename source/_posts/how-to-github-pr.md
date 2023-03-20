---
title: github-pr-step
excerpt: ~~
date: 2021-12-11 19:54:42
tags: js
categories: 前端
---
阅读vue3文档时发现了文字重复的小问题，因此想提交pr。
本文假设你的github username为grace,提交pr地址：[https://github.com/vuejs-translations/docs-zh-cn](https://github.com/vuejs-translations/docs-zh-cn)

### 1）fork
fork就不必说了，在star按钮左边。
### 2）clone到本地
注意：fork后，应该git clone https://github.com/grace/docs-zh-cn.git 而不是项目原来的地址。
### 3）与远程链接
依次执行
git remote -v
git remote add upstream https://github.com/vuejs-translations/docs-zh-cn.git
git remote -v（查看）
### 4）创建&切换分支
假设你想要创建的分支名为xxname：
git branch -b xxname
### 5）在此分支下正常修改代码，ctrl+s保存。然后提交：
git add .
git commit -m 'xxx'
git push origin xxname
### 6）最后一大步，去github提交pr。
去https://github.com/grace/docs-zh-cn也就是你fork的地址，点击tab下的pull request，点击绿色按钮 New pull request，注意最右边compare要选择你刚刚创建的分支的代码（从左往右依次是base repository,base,head repository,**compare**，就是这个compare），然后点击按钮Create pull request，写title+description即可提交一个完整pr。
