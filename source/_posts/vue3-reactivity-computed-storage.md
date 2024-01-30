---
title: 实现@vue/reactivity的computed
excerpt: vue3计算属性、缓存性实现
date: 2023-6-06 23:44:26
tags: 源码
categories: 前端
---

> 首先你至少需要具备中级 JS 水平，并且需要掌握[vue3 effect](/2023/02/22/vue3-reactivity_effect/)的原理，比如其中的 track、trigger 等。如果你懂前者的话，我保证本篇看起来毫无压力~~

首先给出 Vue3 computed 的最简使用方式：

```js
const age = ref(1);
const doubleAge = computed(() => age.value * 2);
```

从这个例子可以看出：

1. computed 是一个函数，返回一个新值；
2. 该函数需要传递一个参数，这个参数是一个 Function，即一个 callback:

那么我们先 init 吧：

```js
function computed(getter: Function) {
  // todo
}
```

到这里你会发现，这和 effect 的实现一样，都是创建一个函数。而我们在 effect 函数内部可以看到，里面会 new 一个 reactiveEffect 这个类，功能都是写在这个类里面的，我们的 computed 也是用这种方式实现，所以，do 起来，我们先定义一个 ComputedRefImpl 类：

```js
class ComputedRefImpl {
  // todo
  private _value
}
```

一步步来，首先用 get value 来获取 value：

```js
class ComputedRefImpl {
  // todo
  private _value
  get value() {
    return this._value
  }
}
```

在这里先提醒一句，咱先不关心 computed 的缓存性,先去想这里的响应性该如何实现。

我这里先说 3 点，根据这三点，就可以实现一个非缓存性的 computed：

1. computed 的参数 callback 执行过程中，需要收集/触发依赖；
2. computed 函数返回的值就是 callback 的值，如上面的 age.value \* 2；
3. reactiveEffect 的 run 方法返回的 effect 的"callback 参数的返回值"；

综上，我们收集触发依赖其实都封装在 reactiveEffect 里面的，因此我们在 computed 里面就可以借助 reactiveEffect 来帮助我们收集和触发。这里我们把它写在 ComputedRefImpl 类的构造函数中：

```js
class ComputedRefImpl {
  private _value
  private _effect: reactiveEffect

  constructor(getter) {
    this._effect = new reactiveEffect(getter)
  }

  get value() {
    // 由于computed返回参数callback的返回值，
    // 而reactiveEffect的实例_effect.run()方法就是返回该callback的返回值的
    // 所以这里就可以用this._effect.run()来获取getter的返回值
    this._value = this._effect.run()
    return this._value
  }
}
```

现在，一个非缓存性的 computed 的内部就差不多了，接下来我们完善 computed 函数，该函数创建 ComputedRefImpl 类的实例并返回：

```js
function computed(getter: Function) {
  const computedRef = new ComputedRefImpl(getter);
  return computedRef;
}
```

到这里，我们再捋一遍流程：

1. 调用 computed 函数，创建 ComputedRefImpl 类实例并返回；
2. 创建 ComputedRefImpl 实例时，执行构造函数，构造函数会创建一个 reactiveEffect 实例，然后将该实例赋值给 ComputedRefImpl 的私有属性\_effect；
3. 当计算属性调用 value 时，执行\_effect.run()去获取 computed 的 callback 的返回值。

目前这个实现中，每次 get value 都需要重新执行 callback 函数然后再得到返回结果，你会发现，这是没有缓存性的。因此在此基础上，我们为 computed 增加缓存性。

要增加缓存性，我们就需要知道，何时 get value 该走缓存值直接 return \_value，何时该走\_effect.run()赋值给\_value 再 return。

思考一下
......
......
......
......
......
......
......

首先我们回到 reactiveEffect 来，我们看一下它的构造函数：

```js
constructor(fn, scheduler?: Function) {
  this._fn = fn
  this.scheduler = scheduler
}
```

该构造函数接收两个参数，第一个是 callback，而第二个！注意，第二个参数名叫做 scheduler，中文可以叫做调度器。他的作用先不表，先继续看跟 scheduler 相关的代码，触发依赖的函数：

```js
export function triggerEffects(dep) {
  // 执行收集到的所有的 effect 的 run 方法
  for (const effect of dep) {
    if (effect.scheduler) {
      // scheduler 可以让用户自己选择调用的时机
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}
```

需要明确一点：当我们在 effect 函数中收集/触发依赖时，收集的是 fn 这个用户传入的 callback 里面的 reactive/ref 的依赖。而触发依赖时，默认我们会执行 effect.run()，相当于把 fn(也就是用户传入的 callback)再执行一次，这其实就类似于 vue3 提供的 watchEffect，比如该用法：

```js
const age = ref(1);
watchEffect(() => {
  console.log(age.value);
});
age.value++;
```

首先会打印 1，然后 age 变化后，又会执行 watchEffect 的 callback，所以 age 变化后就会打印 2

回到触发依赖这里，刚刚说了，默认是走 effect.run()，而如果我们传了 scheduler，就会走 scheduler 而不走 run，即这时候触发依赖后，不会执行传入的第一个参数的那个回调函数了，而是走 scheduler 这个自定义的地方。

那么我们就把 scheduler 当成另外一个 callback，这样 computed 的 callback 的 reactive/ref 触发依赖后，就不会走第一个参数的 getter，而是走 ComputedRefImpl 构造函数的第二个 callback 参数了：

```js
// ComputedRefImpl
constructor(getter) {
  this._effect = new reactiveEffect(getter, () => {
    // 这是一个scheduler，作用是：当依赖的值发生变化的时候，
    // 会执行这个函数，而不是执行run进而执行getter
    // 也就是说，有了这个scheduler，getter里面的依赖的值发生变化的时候，
    // 就不会执行getter这个callback了

    // todo

  })
}
```

然后这里我们引入脏值检测这个概念，说白了就是额外定义一个 boolean 类型的变量去控制是否走缓存值。如果执行了 scheduler 这个 callback，说明依赖更新(被改变)了，这时候就不应该走缓存，而是该重新去拿 getter 的最新值，因此现在代码应该这样改改：

```js
class ComputedRefImpl {
  private _value: any
  private _effect: reactiveEffect
  private _dirty = true
  constructor(getter) {
    this._effect = new reactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true
      }
    })
  }

  get value() {
    if (this._dirty) {
      this._dirty = false
      this._value = this._effect.run()
    }
    return this._value
  }
}
```

初始状态，脏值为 true，那么必走 effect.run()去拿最新的 getter 的返回值，随后就把脏值变为 false。
而如若依赖没有被改变(没有触发依赖，其实就是指 callback 的 reactive/ref 的值没有变),dirty 就继续为 false，那么这时候 get value()就直接 return \_value，而不是去 getter 一次再返回，这样就相当于是拿的缓存值。
而如若 scheduler 这个 callback 执行了，那么说明触发依赖了，那么就把 dirty 变为 true。而计算属性是 get value 的时候才去算其值，所以此时去 get value，就会去执行 getter 这个 callback，去拿最新的返回值了。
