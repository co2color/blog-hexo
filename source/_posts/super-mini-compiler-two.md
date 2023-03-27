---
title: 最小编译器之traverser、transformer和codegen
excerpt: super-tiny-compiler(下)
date: 2023-3-27 23:58:15
tags: js
categories: 前端
---

> 本项目是[the-super-tiny-compiler](https://github.com/jamiebuilds/the-super-tiny-compiler)的 typescript 实现(下半部分)
#### traverser
前面讲了将字符串解析token，然后转为ast树，那么接下来我们要对ast树进行遍历，实现一个traverser函数。

然而，在实现traverser之前，我们必须理解一个设计模式——**访问者模式**。我上一篇博文就是为此而生的，因此这里不再赘述。
同样地，我们先从测试入手，写一个能通过的测试demo：
```js
test('traverser', () => {
  const ast: RootNode = {
    type: NodeTypes.Program,
    body: [
      {
        type: NodeTypes.CallExpression,
        name: 'add',
        params: [
          {
            type: NodeTypes.NumberLiteral,
            value: '2',
          },
          {
            type: NodeTypes.CallExpression,
            name: 'subtract',
            params: [
              {
                type: NodeTypes.NumberLiteral,
                value: '4',
              },
              {
                type: NodeTypes.NumberLiteral,
                value: '2',
              },
            ],
          },
        ],
      },
    ],
  }

  const callCounts: Array<string | NodeTypes>[] = []
  const visitor: Visitor = {
    Program: {
      enter(node, parent) {
        callCounts.push(['program-enter', node.type, ''])
      },
      exit(node, parent) {
        callCounts.push(['program-exit', node.type, ''])
      },
    },

    CallExpression: {
      enter(node, parent) {
        callCounts.push(['callExpression-enter', node.type, parent!.type])
      },
      exit(node, parent) {
        callCounts.push(['callExpression-exit', node.type, parent!.type])
      },
    },

    NumberLiteral: {
      enter(node, parent) {
        callCounts.push(['numberLiteral-enter', node.type, parent!.type])
      },
      exit(node, parent) {
        callCounts.push(['numberLiteral-exit', node.type, parent!.type])
      },
    },
  }

  traverser(ast, visitor)

  expect(callCounts).toEqual([
    ['program-enter', NodeTypes.Program, ''],
    ['callExpression-enter', NodeTypes.CallExpression, NodeTypes.Program],
    ['numberLiteral-enter', NodeTypes.NumberLiteral, NodeTypes.CallExpression],
    ['numberLiteral-exit', NodeTypes.NumberLiteral, NodeTypes.CallExpression],
    [
      'callExpression-enter',
      NodeTypes.CallExpression,
      NodeTypes.CallExpression,
    ],
    ['numberLiteral-enter', NodeTypes.NumberLiteral, NodeTypes.CallExpression],
    ['numberLiteral-exit', NodeTypes.NumberLiteral, NodeTypes.CallExpression],
    ['numberLiteral-enter', NodeTypes.NumberLiteral, NodeTypes.CallExpression],
    ['numberLiteral-exit', NodeTypes.NumberLiteral, NodeTypes.CallExpression],
    ['callExpression-exit', NodeTypes.CallExpression, NodeTypes.CallExpression],
    ['callExpression-exit', NodeTypes.CallExpression, NodeTypes.Program],
    ['program-exit', NodeTypes.Program, ''],
  ])
})
```
上面代码中，你只需要关注ast这个树，以及visitor这个观察者。我们用callCounts用来存储观察者所观察到的“行为”。
由此可见，我们的traverser需要两个参数：ast和visitor。每个visitor都有enter和exit函数，从test中可以发现，每次执行enter或者exit，callCounts就会存储一个NodeType。
话不多说，先来实现：
```js
function traverser(rootNode: RootNode, visitor: Visitor) {

  // 遍历树 深度优先搜索
  function traverArray(array: ChildNode[], parent: ParentNode) {
    array.forEach((node) => {
      traverNode(node, parent)
    })
  }

  function traverNode(node: RootNode | ChildNode, parent?: ParentNode) {

    // enter
    const methods = visitor[node.type]
    if (methods) {
      methods.enter(node, parent)
    }

    switch (node.type) {
      case NodeTypes.Program:
        traverArray(node.body, node)
        break
      case NodeTypes.CallExpression:
        traverArray(node.params, node)
        break
      case NodeTypes.NumberLiteral:
        break
      default:
        break
    }

    // exit
    if (methods && methods.exit) {
      methods.exit(node, parent)
    }

  }
  
  traverNode(rootNode)
  
}
```
上面代码是用深度优先遍历树的算法来遍历这颗ast树，第一次执行traverNode(rootNode)时，没有parent，因此visitor.Program的enter和exit函数的parent参数是不需要的，callCounts第三个参数为空字符串即可。接着继续，深度优先，对子数组进行循环遍历，如果有子孙数组，就以此类推继续循环，也就是递归调用。

#### transformer
接下来是transformer。

