---
title: 最小编译器之traverser、transformer和codegen
excerpt: super-tiny-compiler(下)
date: 2023-3-29 01:08:16
tags: js
categories: 综合
---

> 本项目是[the-super-tiny-compiler](https://github.com/jamiebuilds/the-super-tiny-compiler)的 typescript 实现(下半部分)

#### traverser

前面讲了将字符串解析 token，然后转为 ast 树，那么接下来我们要对 ast 树进行遍历，实现一个 traverser 函数。该函数想做的事情是，深度优先遍历，以此能访问到整棵 ast 树的每个节点。注意，不要想太多，该函数仅仅是想让 Visitor 访问到每一个节点。
对了，在实现 traverser 之前，我们必须理解一个设计模式——**访问者模式**。我上一篇博文就是为此而生的，因此这里不再赘述。
同样地，我们先从测试入手，写一个能通过的测试 demo：

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

上面代码中，你只需要关注 ast 这个树，以及 visitor 这个访问者。我们用 callCounts 用来存储访问者所访问到的“东西”。

由此可见，我们的 traverser 需要两个参数：ast 树和 visitor 对象。在 traverser 函数中会执行 visitor 的各个 enter 和 exit。每个 visitor 都有 enter 和 exit 函数，从 test 中可以发现，每次执行 enter 或者 exit，callCounts 就会存储一个相关 NodeType。
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

上面代码是用深度优先遍历树的算法来遍历这颗 ast 树，第一次执行 traverNode(rootNode)时，没有 parent，因此 visitor.Program 的 enter 和 exit 函数的 parent 参数是不需要的，callCounts 第三个参数为空字符串即可。接着继续，深度优先，对子数组进行循环遍历，如果有子孙数组，就以此类推继续循环，也就是递归调用。
最终会以深度优先的顺序把整棵 ast 树访问完。

#### transformer

接下来是转换器（Transformer）的部分。我们的转换器接受上面的原始 ast 树，结合访问者，return 一个新的 AST：

```js
import { traverser } from './traverser'
export function transformer(ast: RootNode) {
  const newAst = {
    type: NodeTypes.Program,
    body: [],
  }

  ast.context = newAst.body

  traverser(ast, {
    CallExpression: {
      enter(node, parent) {
        if (node.type === NodeTypes.CallExpression) {
          let expression: any = {
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: node.name,
            },
            arguments: [],
          }

          node.context = expression.arguments

          if (parent?.type !== NodeTypes.CallExpression) {
            expression = {
              type: 'ExpressionStatement',
              expression,
            }
          }

          parent?.context?.push(expression)
        }
      },
    },

    NumberLiteral: {
      enter(node, parent) {
        if (node.type === NodeTypes.NumberLiteral) {
          const numberNode: any = {
            type: 'NumberLiteral',
            value: node.value,
          }

          parent?.context?.push(numberNode)
        }
      },
    },
  })

  return newAst
}

```
解析：
首先，创建一个空的新AST对象，类型为Program，body属性为空数组。
接着，给原AST对象添加一个context属性，值为新AST的body属性，用于在遍历原AST时记录当前节点应该被添加到哪个父节点的context中。
然后，使用traverser函数遍历原AST，对于每个CallExpression节点，创建一个新的expression对象，类型为CallExpression，callee属性为一个Identifier对象，name属性为节点的name属性，arguments属性为空数组。接着，将expression对象的context属性设置为节点的arguments属性，用于在遍历CallExpression的子节点时记录当前节点应该被添加到哪个父节点的context中。如果当前节点的父节点不是CallExpression，将expression对象包装在一个ExpressionStatement对象中。最后，将expression对象添加到父节点的context中。
对于每个NumberLiteral节点，创建一个新的numberNode对象，类型为NumberLiteral，value属性为节点的value属性。将numberNode对象添加到父节点的context中。
最后，返回新的AST对象。

这个函数其实就是对 CallExpression 节点类型进行了转换，将其变为了一个更复杂的表达式，包含了 callee 和 arguments 两个子节点。原始 AST 中的 CallExpression 节点只包含了一个 name 属性和一个 params 数组，而在新 AST 中，CallExpression 节点包含了一个 callee 属性和一个 arguments 数组，其中 callee 属性是一个 Identifier 节点，代表了函数名，arguments 数组中包含了对参数进行进一步处理后得到的新的 AST 节点。除此之外，还有一些细节上的变化，例如 AST 中的节点类型名称有所不同等。

你可能会疑惑，为什么当初不直接转成这个 ast，为何要多此一举？
我的个人理解是，生成原始 AST 的过程是通过解析输入的代码字符串得到的，而转换过程则是通过对 AST 节点类型进行遍历，对每一种类型进行相应的处理，得到新的 AST。**这种分离的设计方式，使得编译器的各个部分可以更加独立地进行开发和测试，同时也方便了对编译器进行扩展和修改。**

#### codeGenerator

现在我们进入最后一阶段：codeGenerator（代码生成器）。
codeGenerator 函数将接受 transformer 的结果，也就是新的 Transformed AST，然后根据该 ast 转为新的字符串比如`add(2, subtract(4, 2))`：

```js
export function codeGenerator(node) {
  switch (node.type) {
    case 'Program':
      return node.body.map(codeGenerator).join('')
    case 'ExpressionStatement':
      return codeGenerator(node.expression) + ';'
    case 'NumberLiteral':
      return node.value
    case 'CallExpression':
      return (
        node.callee.name +
        '(' +
        node.arguments.map(codeGenerator).join(', ') +
        ')'
      )
  }
}
```

简单解释：

- 在处理 Program 类型的节点时，它会递归处理节点的 body 属性中的所有节点，并将它们的代码字符串连接起来返回。
- 在处理 ExpressionStatement 类型的节点时，它会递归处理节点的 expression 属性，并在最后加上一个分号，返回生成的代码字符串。
- 在处理 NumberLiteral 类型的节点时，它会直接返回节点的值。
- 在处理 CallExpression 类型的节点时，它会生成一个函数调用的代码字符串，包括函数名和参数列表，并在其中递归调用每个参数节点的 codeGenerator 函数，最后将它们连接起来返回。

#### compiler

FINALLY!!这个最简单，就是把上面的各个函数按顺序调用，实现 str code ->ast-> transformer ast-> code str

```js
function compiler(code: string) {
  const tokens = tokenizer(code)
  const ast = parser(tokens)
  const transformedAst = transformer(ast)
  return codeGenerator(transformedAst)
}
```

### 总结

调用 compiler：

```js
compiler(`(add 2 (subtract 4 2))`)
```

此时经过 tokenizer 的 tokens 值为：

```js
const tokens = [
  { type: TokenTypes.Paren, value: '(' },
  { type: TokenTypes.Name, value: 'add' },
  { type: TokenTypes.Number, value: '2' },
  { type: TokenTypes.Paren, value: '(' },
  { type: TokenTypes.Name, value: 'subtract' },
  { type: TokenTypes.Number, value: '4' },
  { type: TokenTypes.Number, value: '2' },
  { type: TokenTypes.Paren, value: ')' },
  { type: TokenTypes.Paren, value: ')' },
]
```

然后 parser 解析 tokens，得到的 ast 为：

```js
const ast = {
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
```
然后transformer转换上面的ast，得到的transformedAst为：
```js
const transformedAST = {
  type: NodeTypes.Program,
  body: [
    {
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'add',
        },
        arguments: [
          {
            type: 'NumberLiteral',
            value: '2',
          },
          {
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: 'subtract',
            },
            arguments: [
              {
                type: 'NumberLiteral',
                value: '4',
              },
              {
                type: 'NumberLiteral',
                value: '2',
              },
            ],
          },
        ],
      },
    },
  ],
}
```
最后调用codeGenerator，传入transformedAST，得到的结果为：
```js
const result = `add(2, subtract(4, 2))`
```

最终，我们实现了将`(add 2 (subtract 4 2))`转换为`add(2, subtract(4, 2))`的过程。

### 源码
[https://github.com/co2color/super-tiny-compiler](https://github.com/co2color/super-tiny-compiler)
