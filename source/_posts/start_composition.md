---
title: 什么叫「组合优于继承」?
excerpt: 组合vs继承 by js
date: 2023-08-06 23:38:16
tags: 综合
categories: 综合
---

现在我是一个项目经理，我有如下需求：一个动物园项目，有动物这个总的 Animal 类；动物分为鸟类和行走类；两种类型的动物都会吃饭；其中鸟类的动物会飞；而行走类动物只会用腿走路。

**用继承来实现上面的需求：**

```js
// Animal 类定义了共享的方法
class Animal {
  constructor(name) {
    this.name = name
  }

  eat() {
    console.log(this.name + ' is eating.')
  }
}

// Walker 类继承 Animal 类
class Walker extends Animal {
  walk() {
    console.log(this.name + ' is walking.')
  }
}

// Bird 类继承 Animal 类，并添加额外的方法
class Bird extends Animal {
  fly() {
    console.log(this.name + ' is flying.')
  }
}

// 创建对象并调用方法
const sparrow = new Bird('sparrow') // 麻雀
sparrow.eat() // sparrow is eating.
sparrow.fly() // sparrow is flying.

const dog = new Walker('Dog')
dog.eat() // Dog is eating.
dog.walk() // Dog is walking.
```

很好，你的动物园有很多会飞的鸟，以及很多可爱的小狗狗，现在动物园一片和谐毫无 bug~

......Two thousand years later......

今天动物园来了一条大蟒蛇，该死的，这玩意不会 walk，因为它没有腿，它只会爬！

但接手项目的人不愿意去翻看上古时代的 Animal 的源码，它觉得与蛇类似动物都继承自 Walker，没关系的，先继承了再说。

于是，在你们的动物园里，蛇变异成了一个“行走动物”，它明明没有腿却在凭空行走！你意识到，出 bug 了，于是回去看源码，发现前辈们居然给源头 Animal 类都添加了 walk 方法，你心想，这个前辈得多没见识，连蛇都没见过！然后第二天动物园又来了只鸵鸟.....该死的，鸵鸟不会飞！但由于你让鸵鸟继承了 Bird 类，结果鸵鸟也会凭空飞翔了...

该死的继承，害得你不得不回头看以前的代码，不然一不留神就写 bug 了。如果这是一个模拟动物园的游戏，那你这个游戏简直是奇观异景众生百态....

为了修复这个 bug，你可以做如下改动：

```js
class Snake extends Walker {
  walk() {
    throw new Error('Snake can not walk.')
  }
  crawl() {
    // 其实Snake压根就不应该继承自Walker，而应该继承自一个叫做Crawler的爬行类
    console.log(this.name + ' is crawling.')
  }
}
class Ostrich extends Bird {
  fly() {
    // 跟上面不一样，鸵鸟理应继承自Bird
    throw new Error('Ostrich can not fly.')
  }
}
```

上面是第一种做法。还有一种做法，是加 branch，即把 Bird 分为会飞的和不会飞的，那么鸵鸟继承自不会飞的鸟类就好了。

```js
class Bird extends Animal {
  // 不能写fly
}
class canNotFlyBird extends Bird {
  canJustWalk() {}
}
class canFlyBird extends Bird {
  canFly() {}
}
```

啊西....屎山代码的既视感扑面而来....

继承是静态的，无法在运行时改变。后面增加的行为，你如果全部放在父类，那么这个操作虽然提高了复用性，但同时也会改变子类的行为，当然了，如果程序员对这个不稳定因素可控，那倒好说，你得保证新增加的父类的行为(功能、函数、方法，怎么叫都可以)不会被不该调用的子类实例(鸵鸟.fly() or snake.walk()等等)所调用；同时子类需要抛出错误，这增加了代码的复杂性，是我们不想看到的。另外，鸵鸟没有 fly，但它依然是鸟，所以 fly 方法一开始就不应该放到 Bird 类中。

**那么，如果用组合来实现：**

```js
class Animal {
  constructor(name) {
    this.name = name
  }
  eat() {
    console.log(this.name + ' is eating.')
  }
}

// 鸵鸟类组合 Animal 类，并添加额外的方法
class Ostrich {
  constructor(name) {
    this.animal = new Animal(name)
  }

  // 委托 Animal 类的方法
  eat() {
    this.animal.eat()
  }
  walk() {
    console.log(this.animal.name + ' is walking.')
  }
}

// Dog 类组合 Animal 类，并添加额外的方法
class Dog {
  constructor(name) {
    this.animal = new Animal(name)
  }
  // 可以和Ostrich一样委托Animal的eat，不写也可以，使用new Dog('').animal.eat()调用即可

  walk() {
    console.log(this.animal.name + ' is walking.')
  }
}

const dog = new Dog('Dog')
dog.eat()
dog.walk() // Dog is walking.

const ostrich = new Ostrich('Ostrich')
ostrich.animal.eat()
ostrich.walk() // Ostrich is walking.
```

当你使用继承时，你发现一个 Bird 类不够用，于是就可能分化出 can fly 和 can't fly 的两个 Bird，这样不断拆分后，是很难以维护的；而使用组合委托，你就不需要无限拆分了，这样，我们可以更灵活地组合不同的对象，而不需要受限于单一的继承关系。这符合了"组合优于继承"的设计原则。

上面的 demo 强行使用了 class，但我在[这篇文章](https://co2color.netlify.app/2023/07/02/this_class_js/)中很吐槽 class 了，所以，再给出一个非 class 的 demo。

如今随着 Be Your Dad 对日系三大妈的单方面虐杀，新能源汽车卖得越来越火热。因此，我们把大街上的私人汽车分为油车和电车，车都有启动和停止的功能，油车只能加油，纯电车只能充电，混动车可油可电。

给出组合示例：

```js
// 父对象
const carMixin = {
  start() {
    console.log('汽车启动')
  },
  stop() {
    console.log('汽车停止')
  },
}

// 三个Mixin

// 子对象 - 电动汽车
const electricMixin = {
  charge() {
    console.log('电动汽车充电')
  },
}

// 子对象 - 加油汽车
const refuelMixin = {
  refuel() {
    console.log('汽车加油')
  },
}

// 子对象 - 混动汽车
const hybridMixin = {
  ...electricMixin,
  ...refuelMixin,
}

// 三个实例

// 组合对象 - 电动汽车
const electricCar = {
  ...carMixin,
  ...electricMixin,
}

// 组合对象 - 加油汽车
const fueledCar = {
  ...carMixin,
  ...refuelMixin,
}

// 组合对象 - 混合动力车
const hybridCar = {
  ...carMixin,
  ...hybridMixin,
}

// 使用组合对象 - 电动汽车
electricCar.start() // 输出: 汽车启动
electricCar.stop() // 输出: 汽车停止
electricCar.charge() // 输出: 电动汽车充电

// 使用组合对象 - 加油汽车
fueledCar.start() // 输出: 汽车启动
fueledCar.stop() // 输出: 汽车停止
fueledCar.refuel() // 输出: 汽车加油

// 使用组合对象 - 混动汽车
hybridCar.start() // 输出: 汽车启动
hybridCar.stop() // 输出: 汽车停止
hybridCar.charge() // 输出: 电动汽车充电
hybridCar.refuel() // 输出: 汽车加油
```

可以发现，使用组合策略，你最好能“单一最小化”，比如在该例子中，汽车充电和汽车加油需要分开，不能合在一起，这样才能解耦最大化。

这个例子如果使用继承，那么充电车和混动车，都需要写一次 charge 方法，加油车和混动车都需要写一次 refuel 方法，这样代码复用率就降低了。

不过看到这个例子，vuer 可能会怒吼：“mixin 不是 vue 中的糟粕吗！你怎么还在用 mixin！”

我曰：vue2 中的 mixin 的坏处是把多个 mixin 都绑定到了一个 this 上面，导致来源不清晰、冲突等问题，然而跟该例子中的 mixin 是两件事，不要搞混了....该例子中每个 mixin 的内容自己控制，**用 mixin 的对象都是各自独立的**，要清楚这一点。

总结：继承想要好，就得一开始设计得好，父类最开始的时候就不能加太多的功能；而组合想要好，就挨个添加需要的功能，虽然一时半会代码量增多了，但是后面可以通过复用(比如该 demo 中 charge 和 refuelf 方法)来降低代码量。所以我认为组合的上限和下限都比继承高。
