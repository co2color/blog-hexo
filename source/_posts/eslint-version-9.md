---
title: eslint9.x尝鲜
excerpt: 2024年eslint发布了v9.x，不少feature
date: 2024-07-04 23:44:13
tags: 综合
categories: 前端
---

首先说2个点：

- eslint9 弃用 eslintrc 文件，使用 eslint.config.(m/c)js 替代;

- 从 v8.53.0 开始，eslint 将把很多跟空格格式化相关的 rule 标记为待废弃，v9.x 还能继续使用，貌似在 v10.0 之前都不会删除。详情请看[这篇讨论](https://github.com/eslint/eslint/issues/17522)，比如 key-spacing 这种常用的格式化规则就会被废弃。想使用这些规则可以用`@stylistic/eslint-plugin` 这个库。

#### 使用

以 typescript 项目为例，安装需要的包：

```json
// 注意，v9刚出来，所以这些生态包此时此刻都是beta版本
"devDependencies": {
  "@stylistic/eslint-plugin": "2.6.0-beta.0",
  "eslint": "9.6.0",
  "typescript": "^5.5.3",
  "typescript-eslint": "8.0.0-alpha.39",
  "@eslint/js": "^9.6.0"
}
```

然后创建 eslint.config.mjs（esmodule 就用 mjs，commonjs 就用.cjs，最好在 package.json 中的 type 字段定义）：

```js
export default [];
```

可以看出，v9.x 导出了一个数组，因此如果是 monorepo，有几个子项目就可以在这里配置几个对象，根据 files 规则去匹配对应的项目用，这个查文档即可，不多废话（这是其中一个原因，不代表多个obj只能是多个项目）

首先，不考虑 ts 项目的情况下，最简单的配置：

```js
export default [
  {
    rules: {
      semi: ["error", "never"],
    },
  },
];
```

如果你只用 js，这样其实就完成了基本配置了，你需要什么就加什么。比如eslint9默认的cli会配置这两个包的json：
``` js
import globals from 'globals'
import pluginJs from '@eslint/js'

export default [
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  {
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      semi: ["error", "never"],
    }
  }
]
```
如上，这里是[globals的配置数据](https://github.com/sindresorhus/globals/blob/main/globals.json)和[@eslint/js的配置数据](https://github1s.com/eslint/eslint/blob/main/packages/js/src/configs/eslint-recommended.js)可供参考。

加上 ts 的话，需要如下配置：

```js
import tseslint from "typescript-eslint";

export default [
  ...tseslint.configs.recommended,
  {
    rules: {
      semi: ["error", "never"],
    },
  },
];
```

如上，用扩展运算符带入进去。注意了，v9 没有 extends 关键字，只能这样引入。你不要相信目前很多网上的文档，那些都是 v8 的操作，如上的写法是 eslint 官方推荐的。

再来，前面提到，从 v8.53.0 开始，eslint官方待弃用了很多空格相关的规则。什么是空格相关的规则？举个例子：

```js
// 错误的：
const obj = 空格空格空格{
  空格空格空格a: 空格空格空格1
}

// 正确的：
const obj = {
  a: 1
}
```

上面的代码有 3 个空格规则错误：

- "空格空格空格 a" 属于 indent 的错误;
- "a: 空格空格空格 1" 属于 key-spacing 的错误；
- "obj =空格空格空格{" 属于 no-multi-spaces 的错误；

eslint 官方其实不再希望我们使用 eslint 作为源码格式化的工具。可如果我们就是想用呢？参考[Why I don't use Prettier](https://antfu.me/posts/why-not-prettier)这篇文章，我是非常赞同的。我们可以用`@stylistic/eslint-plugin`这个库来继续使用这些跟空格相关的规则。多说一句，这个库就是 antfu 大佬自己主动承接下来的，eslint 官方说弃用这些规则后，antfu 就说：那交给我来维护吧，于是就有了[eslint.style](https://eslint.style/)这个库。

该库的配置如下：

```js
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";

export default [
  ...tseslint.configs.recommended,
  {
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      "@stylistic/semi": ["error", "never"],
      "@stylistic/quotes": ["error", "single"],
      "@stylistic/no-multiple-empty-lines": ["error", { max: 1 }],
      "@stylistic/no-multi-spaces": ["error"],
      "@stylistic/key-spacing": "error",
      "@stylistic/indent": ["error", 2],
    },
  },
];
```

如上，在原有的规则名上加入"@stylistic/"即可。

当然了，目前生产环境不是很推荐立马使用 v9，起码等周边生态库全部摆脱 beta 版本后，再考虑上 v9 吧，如果是个人项目就随便折腾了~
