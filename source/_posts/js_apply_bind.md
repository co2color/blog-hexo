---
title: 老生常谈：手写js的call/apply和bind
excerpt: 手写系列（四）
date: 2023-3-7 00:10:30
tags: js
categories: 前端
---
> 首先，对this没有最最基本的了解的同学，请阅读[相关文章](https://zh.javascript.info/object-methods)后再来此地探索。
总而言之，**this 永远指向最后调用它的那个对象**


### 首先给出call的实现：
``` js
Function.prototype.mycall = function (context, ...args) {
  context = context || window
  const key = Symbol()
  // 谁调用mycall，this就是谁。如果不能理解这里this是什么，可以看我下面大段的人话。
  // 所以这里this就是下面的demo1中的introduce函数，该函数被赋值给了context里面的key属性。
  context[key] = this
  // context[key]()调用，key函数是被context调用的，所以key里面的this就指向了context
  // 最终，introduce的this就指向了person对象，函数里面的this.name就是person.name了
  const result = context[key](...args)
  Reflect.deleteProperty(context, key)
  return result
} 

// demo1
const person = {
  name: "Alice",
  age: 30
}
function introduce(greeting) {
  console.log(`${greeting}, my name is ${this.name} and I am ${this.age} years old.`)
}
introduce.mycall(person, "Hello") // Hello, my name is Alice and I am 30 years old.

// demo2
const person = {
  name: 'Alice',
  greet() {
    console.log(`Hello, my name is ${this.name}`)
  }
};
const dog = { name: 'Fido' }
person.greet.mycall(dog) // 输出 "Hello, my name is Fido"
```

**如果你不懂上面的context[key] = this，看这里：**
在上面示例中，我们定义了一个person对象和一个introduce函数。然后，我们使用mycall函数来将person对象作为introduce函数的上下文对象，并传递一个greeting参数。最终，introduce函数被调用，并输出一条问候语和person对象的信息。
**重点：**看我上面说的“谁调用mycall，this就是谁”，所以这里this的值实际上是指向调用 mycall这个函数的函数，也就是要修改上下文的那个函数，说白了就是指向introduce，也就是introduce这个函数被赋值给了context[key]，因此context[key]被调用，也就是introduce被调用啦。

**再来点非人话：**
在 mycall 函数中，this 的值实际上是指向调用 mycall 函数的函数，也就是要修改上下文的那个函数。而在 fn.call(context, args) 中，fn 指的就是这个要修改上下文的函数，而 context 则是这个函数在执行时的上下文， args 则是要传递给这个函数的参数。
我们可以将 mycall 函数想象成是把要修改上下文的函数拎出来执行，只不过这个函数在执行时的上下文被修改了。而 context[key] 则是将这个函数设置在新的上下文对象 context 上，key 则是要设置在上下文对象上的属性名。由于函数可以被当做普通的值进行赋值，因此我们可以将要修改上下文的函数设置在上下文对象上，从而改变这个函数在执行时的上下文。

再唠叨几句。
上面使用了ES6的剩余参数（rest parameter）语法来接收任意数量的参数。在函数内部，我们先设置默认的上下文对象为window，这里使用了逻辑或运算符来实现。然后，我们使用Symbol()函数生成一个唯一的属性名，将当前函数作为上下文对象的一个属性值，并调用该函数。最后，我们删除这个属性并返回调用结果。这样，我们就实现了自己的mycall函数，它的作用和原生的call函数一样。
同时，使用Symbol()函数生成一个唯一的属性名，并将其赋值给key常量。然后，我们将当前函数作为上下文对象的一个属性值，并调用该函数。最后，我们使用Reflect.deleteProperty方法删除该属性，这样就不会有任何副作用。
我个人认为这个实现比掘金很多人的要好。他们有的人不用symbol实现，就context.func = this，这样是完全错误完全不可接受的实现.....甚至还特么有生成8位随机数当作key....简直离了个大谱.......

### apply的实现

apply就是把上面的mycall的第二个形参改成args，传数组进来，args本身就是一个数组，然后再在下面解构后就可以一个个传入函数中。
``` js
Function.prototype.mycall = function (context, args) {
  // ...
  // 函数体跟上面完完全全一样（在不考虑边界条件的情况下，因为我们只是为了实现功能，为了理解其内在而已）
}
```

### bind的实现
``` js
// 纯自己实现
Function.prototype.mybind = function (target,...outArgs) {
  target = target || {} // 处理边界条件
  const symbolKey = Symbol()
  target[symbolKey] = this
  return function (...innerArgs) { // 返回一个函数
    const res = target[symbolKey](...outArgs, ...innerArgs) // outArgs和innerArgs都是一个数组，解构后传入函数
    // 这里千万不能销毁绑定的函数，否则第二次调用的时候，就会出现问题。
    // Reflect.deleteProperty(target, symbolKey)
    return res
  } 
}
```


``` js
// 借助apply：
Function.prototype.mybind = function(context, ...args1) {
  const fn = this
  return function(...args2) {
    return fn.apply(context, [...args1, ...args2])
  }
}
```

``` js
// 借助call实现
Function.prototype.mybind = function(context, ...args1) {
  const fn = this
  return function(...args2) {
    const allArgs = args1.concat(args2)
    const result = fn.call(context, ...allArgs)
    return result
  }
}
```
这个mybind方法与之前的mycall和myapply方法略有不同。它返回了一个新的函数，而不是直接调用原始函数。返回的新函数将在指定的上下文中调用原始函数，并使用提供的参数（即在mybind中传递的参数和调用新函数时传递的参数）。

使用mybind方法的示例：
``` js
const person = {
  name: 'Alice',
  greet(greeting) {
    console.log(`${greeting}, ${this.name}!`)
  }
}

const greet = person.greet.mybind(person, 'Hello')
greet() // 输出 "Hello, Alice!"

const otherPerson = { name: 'Bob' }
greet.call(otherPerson) // 输出 "Hello, Alice!"
```
在这个示例中，我们定义了一个名为person的对象，它具有一个greet方法。我们使用mybind方法创建了一个新函数greet，它将在person对象上下文中调用原始函数person.greet。我们还传递了一个额外的参数'Hello'，这意味着greet函数将始终使用'Hello'作为第一个参数调用person.greet。

我们在第一个调用中使用greet函数而不传递任何参数，这将导致person.greet方法以'Hello'和person作为参数调用，并输出"Hello, Alice!"。在第二个调用中，我们使用call方法将otherPerson对象作为greet函数的上下文，并期望输出"Hello, Bob!"。然而，由于我们使用了mybind方法绑定person对象作为上下文，greet函数将始终使用person作为上下文，而不管我们传递了什么样的参数。因此，第二个调用仍然输出"Hello, Alice!"。


