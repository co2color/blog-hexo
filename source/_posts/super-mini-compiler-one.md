---
title: 最小编译器之tokenizer和parser
excerpt: super-tiny-compiler(上)
date: 2023-3-21 22:40:02
tags: js
categories: 前端
---
> 本项目是[the-super-tiny-compiler](https://github.com/jamiebuilds/the-super-tiny-compiler)的typescript实现(上半部分)

直接步入正题吧。
现在有如下代码：
```js
const code = `(add 2 (subtract 4 2))`
```
我们需要将这个字符串解析，转为parser[]数组。parser数组每个item的Token的类型：
```js
export enum TokenTypes {
  Paren, // 左右括号
  Name, // 操作符，如add subtract
  Number,
  String,
}
export interface Token {
  type: TokenTypes;
  value: string;
}
```
遇到左右括号、操作符（加减乘除等）、数字时，就应该把该项push进数组。所以在code这段字符串中，除去空格忽略不计，转为的parser数组长度应该为9。先不看实现过程，我们可以通过肉眼看出，该code的转换结果应该为：
```js
const tokens = [
  { type: TokenTypes.Paren, value: "(" },
  { type: TokenTypes.Name, value: "add" },
  { type: TokenTypes.Number, value: "2" },
  { type: TokenTypes.Paren, value: "(" },
  { type: TokenTypes.Name, value: "subtract" },
  { type: TokenTypes.Number, value: "4" },
  { type: TokenTypes.Number, value: "2" },
  { type: TokenTypes.Paren, value: ")" },
  { type: TokenTypes.Paren, value: ")" },
];
```
所以我们可以写好测试逻辑，这里用vitest：
```js
import { test, expect } from 'vitest'
import { tokenizer, TokenTypes } from './tokenizer'

test('tokenizer', () => {
  const code = `(add 2 (subtract 4 2))`
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
  // 需要实现tokenizer这个转换函数
  expect(tokenizer(code)).toEqual(tokens)
})
```
接下来实现tokenizer。首先我们肯定需要循环去遍历整个字符串，这里我们使用while+指针的方式去遍历。实现思路：
- 创建数组：`const tokens: Token[] = []`
- 遇到空格时，指针+1，continue，进行下一次循环；
- 遇到左右括号，创建一个Token类型的对象，把对象push到数组里，指针+1，continue；
- 遇到字符串或者数字，再来一个while循环（字符串/数字各种独立实现）或者其实你可以有自己的实现方式，目的就是拿到这一段字符串/数字，比如code字符串中的"add"字符串，遇到a字符的时候就while，然后遇到d继续，add后面是一个空格"add ("，所以遇到非字符串的时候，就结束该while循环。
那么我们就来实现它吧：
```js
export function tokenizer(code: string) {
  const tokens: Token[] = [];
  let current = 0;

  while (current < code.length) {
    let char = code[current];

    const WHITESPACE = /s/;
    if (WHITESPACE.test(char)) {
      current++;
      continue;
    }

    if (char === "(") {
      tokens.push({
        type: TokenTypes.Paren,
        value: char,
      });
      current++;
      continue;
    }

    if (char === ")") {
      tokens.push({
        type: TokenTypes.Paren,
        value: char,
      });
      current++;
      continue;
    }

    const LETTERS = /[a-z]/i;
    if (LETTERS.test(char)) {
      let value = "";
      while (LETTERS.test(char) && current < code.length) {
        value += char;
        char = code[++current];
      }
      tokens.push({ type: TokenTypes.Name, value });
      continue;
    }

    const NUMBERS = /[0-9]/;
    if (NUMBERS.test(char)) {
      let value = "";
      while (NUMBERS.test(char) && current < code.length) {
        value += char;
        char = code[++current];
      }
      tokens.push({ type: TokenTypes.Number, value });
      continue;
    }
  }

  return tokens;
}
```


**接下来我们需要将tokens数组解析(parser)成ast树。**
所以这里需要实现一个parser函数。话不多说，代码并不复杂，先给出实现，再讲讲：
```js
function createRootNode(): RootNode {
  return {
    type: NodeTypes.Program,
    body: [],
  }
}

export function parser(tokens: Token[]) {
  const root = createRootNode();

  let current = 0;

  function walk() {
    let token = tokens[current];

    if (token.type === TokenTypes.Number) {
      current++;

      return createNumberLiteralNode(token.value);
    }

    if (token.type === TokenTypes.String) {
      current++;

      return createStringLiteralNode(token.value);
    }

    if (token.type === TokenTypes.Paren && token.value === "(") {
      token = tokens[++current];

      let node = createCallExpression(token.value);

      // 上一个 token 已经使用完了  所以我们还需要在移动下位置
      token = tokens[++current];
      // params
      while (
        // token.type !== TokenType.paren ||
        // (token.type === TokenType.paren && token.value !== ")")
        !(token.type === TokenTypes.Paren && token.value === ")")
      ) {
        node.params.push(walk());
        token = tokens[current];
      }

      // 跳过 )
      current++;

      return node;
    }

    throw new Error(`识别不了的 token: ${token}`);
  }

  while (current < tokens.length) {
    root.body.push(walk());
  }

  return root;
}
```
其实如果你的递归水平不错， 就不需要看下面的分析了，直接看上面代码就行了，下面的内容就是讲述这个递归思路的。
对于这个测试用例tokens:
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
首先执行rootNode.body.push(walk())，我们把这个walk叫做walk1
执行walk1，里面创建一个createCallExpressionNode('add')，我们叫他AddNode
AddNode的params会push一个NumberNode('2')，此时AddNode.params长度为1；
然后继续while，继续while的话，因为紧接着就是左括号（token[3]），所以又会创建一个walk叫做walk2
这个walk2的返回结果要被push到AddNode.params里面，也就是被push到NumberNode('2')后面，使AddNode.params长度为2.
因此我们要看看walk2到底返回什么东西后，才能push到AddNode.params里面，使得其长度为2:
walk2中，会创建一个新的createCallExpressionNode('subtract')，我们叫他SubtractNode
SubtractNode的params会push一个NumberNode('4')和一个NumberNode('2')
所以walk2就返回SubtractNode(NumberNode(4),NumberNode(2))，把结果push到AddNode.params里面
因此walk1就返回AddNode(NumberNode(2),SubtractNode(NumberNode(4),NumberNode(2)))，然后walk1就结束了
表达式即：**( 2 + ( 4 - 2 ) )**
然后解释一下最下面的while（可参考test中的'two callExpression'）:
```js
while (current < tokens.length) {
  const outWalkNode = walk()
  rootNode.body.push(outWalkNode)
}
```
这段代码是为了处理多个表达式的情况，比如：
( ( 2 + 4 ) (3 + 5 ) )
如果遇到了，就重复上面的过程，把结果push到rootNode.body里面，最后返回rootNode。