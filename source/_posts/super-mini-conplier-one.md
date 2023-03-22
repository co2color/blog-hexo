---
title: 最小编译器之tokenizer和parser
excerpt: super-tiny-compiler(一)
date: 2023-3-21 22:40:02
tags: js
categories: 前端
---
本项目是[the-super-tiny-compiler](https://github.com/jamiebuilds/the-super-tiny-compiler)的typescript实现。

直接步入正题吧。
现在有如下代码：
```
const code = `(add 2 (subtract 4 2))`
```
我们需要将这个字符串解析，转为parser[]数组。parser数组每个item的格式为：
```
export enum TokenTypes {
  Paren,
  Name,
  Number,
  String,
}
export interface Token {
  type: TokenTypes;
  value: string;
}
```
遇到左右括号、操作符（加减乘除等）、数字时，就应该把该项push进数组。所以code这段字符串中，除去空格忽略不计，转为的parser数组长度应该为9，结果应为：
```
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
```
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
```
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
至此，tokenizer的测试也就能通过了。