---
title: 设计模式之访问者模式
excerpt: Visitor Pattern
date: 2023-3-24 23:38:35
tags: js
categories: 设计模式
---
访问者模式是一种行为设计模式，它可以将算法与对象结构分离。该模式允许你定义一个新的操作（访问者），而不改变被操作的对象结构。

举个例子：
假设有一个 Document 对象，包含多个 Element 对象，如 Heading、Paragraph、Image 等。我们希望能够对这些元素进行不同的操作，例如计算它们的字符数、提取它们的文本内容等。我们可以使用访问者模式来实现这个功能。

首先，我们需要定义一个访问者对象，它包含不同的方法来处理不同类型的元素：
```js
class Visitor {
  visitHeading(heading) {
    console.log(`Heading text: ${heading.text}`);
  }

  visitParagraph(paragraph) {
    console.log(`Paragraph text: ${paragraph.text}`);
  }

  visitImage(image) {
    console.log(`Image URL: ${image.url}`);
  }
}
```
然后，我们需要定义一个抽象的元素对象，它包含一个 accept 方法，该方法接受一个访问者对象作为参数：
```js
class Element {
  accept(visitor) {
    throw new Error("Method 'accept' must be implemented.");
  }
}

```
现在，我们可以定义具体的元素对象，例如 Heading、Paragraph 和 Image：
```js
class Heading extends Element {
  constructor(text) {
    super();
    this.text = text;
  }

  accept(visitor) {
    visitor.visitHeading(this);
  }
}

class Paragraph extends Element {
  constructor(text) {
    super();
    this.text = text;
  }

  accept(visitor) {
    visitor.visitParagraph(this);
  }
}

class Image extends Element {
  constructor(url) {
    super();
    this.url = url;
  }

  accept(visitor) {
    visitor.visitImage(this);
  }
}
```
最后，我们可以使用访问者模式来对对象结构进行操作：
```js
const document = [
  new Heading("Hello, world!"),
  new Paragraph("Lorem ipsum dolor sit amet, consectetur adipiscing elit."),
  new Image("https://example.com/image.jpg"),
];

const visitor = new Visitor();

document.forEach((element) => {
  element.accept(visitor);
});
```
输出结果为：
```
Heading text: Hello, world!
Paragraph text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Image URL: https://example.com/image.jpg
```
这个例子说明了如何使用访问者模式来处理一个对象结构中的不同元素。它将算法与对象结构分离，并允许我们定义新的操作，而不改变被操作的对象结构。
