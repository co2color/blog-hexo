---
title: 实现@vue/reactivity的computed
excerpt: vue3计算属性、缓存性实现
date: 2023-6-06 23:44:26
tags: 源码
categories: 前端
---

> 首先你至少需要具备中级JS水平，并且需要掌握[vue3 effect](https://co2color.netlify.app/2023/02/22/vue3-reactivity_effect/)的原理，比如其中的track、trigger等。如果你懂前者的话，我保证本篇看起来毫无压力~~


首先给出Vue3 computed的最简使用方式：
``` js
const age = ref(1)
const doubleAge = computed(() => age.value * 2)
```
从这个例子可以看出：
1. computed是一个函数，返回一个新值；
2. 该函数需要传递一个参数，这个参数是一个Function，即一个callback:

那么我们先init吧：
``` js
function computed(getter: Function) {
  // todo
}
```

到这里你会发现，这和effect的实现一样，都是创建一个函数。而我们在effect函数内部可以看到，里面会new一个reactiveEffect这个类，功能都是写在这个类里面的，我们的computed也是用这种方式实现，所以，do起来，我们先定义一个ComputedRefImpl类：
``` js
class ComputedRefImpl {
  // todo
  private _value
}
```
一步步来，首先用get value来获取value：
``` js
class ComputedRefImpl {
  // todo
  private _value
  get value() {
    return this._value
  }
}
```

在这里先提醒一句，咱先不关心computed的缓存性,先去想这里的响应性该如何实现。

我这里先说3点，根据这三点，就可以实现一个非缓存性的computed：
1. computed的参数callback执行过程中，需要收集/触发依赖；
2. computed函数返回的值就是callback的值，如上面的age.value * 2；
3. reactiveEffect的run方法返回的effect的"callback参数的返回值"；

综上，我们收集触发依赖其实都封装在reactiveEffect里面的，因此我们在computed里面就可以借助reactiveEffect来帮助我们收集和触发。这里我们把它写在ComputedRefImpl类的构造函数中：
``` js
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
现在，一个非缓存性的computed的内部就差不多了，接下来我们完善computed函数，该函数创建ComputedRefImpl类的实例并返回：
``` js
function computed(getter: Function) {
  const computedRef = new ComputedRefImpl(getter)
  return computedRef
}
```
到这里，我们再捋一遍流程：
1. 调用computed函数，创建ComputedRefImpl类实例并返回；
2. 创建ComputedRefImpl实例时，执行构造函数，构造函数会创建一个reactiveEffect实例，然后将该实例赋值给ComputedRefImpl的私有属性_effect；
3. 当计算属性调用value时，执行_effect.run()去获取computed的callback的返回值。

目前这个实现中，每次get value都需要重新执行callback函数然后再得到返回结果，你会发现，这是没有缓存性的。因此在此基础上，我们为computed增加缓存性。

要增加缓存性，我们就需要知道，何时get value该走缓存值直接return _value，何时该走_effect.run()赋值给_value再return。

思考一下
......
......
......
......
......
......
......

首先我们回到reactiveEffect来，我们看一下它的构造函数：
``` js
constructor(fn, scheduler?: Function) {
  this._fn = fn
  this.scheduler = scheduler
}
```
该构造函数接收两个参数，第一个是callback，而第二个！注意，第二个参数名叫做scheduler，中文可以叫做调度器。他的作用先不表，先继续看跟scheduler相关的代码，触发依赖的函数：
``` js
export function triggerEffects(dep) {
  // 执行收集到的所有的 effect 的 run 方法
  for (const effect of dep) {
    if (effect.scheduler) {
      // scheduler 可以让用户自己选择调用的时机
      effect.scheduler()
    }
    else {
      effect.run()
    }
  }
}
```

需要明确一点：当我们在effect函数中收集/触发依赖时，收集的是fn这个用户传入的callback里面的reactive/ref的依赖。而触发依赖时，默认我们会执行effect.run()，相当于把fn(也就是用户传入的callback)再执行一次，这其实就类似于vue3提供的watchEffect，比如该用法：
``` js
const age = ref(1)
watchEffect(() => {
  console.log(age.value)
})
age.value++
```
首先会打印1，然后age变化后，又会执行watchEffect的callback，所以age变化后就会打印2

回到触发依赖这里，刚刚说了，默认是走effect.run()，而如果我们传了scheduler，就会走scheduler而不走run，即这时候触发依赖后，不会执行传入的第一个参数的那个回调函数了，而是走scheduler这个自定义的地方。

那么我们就把scheduler当成另外一个callback，这样computed的callback的reactive/ref触发依赖后，就不会走第一个参数的getter，而是走ComputedRefImpl构造函数的第二个callback参数了：
``` js
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
然后这里我们引入脏值检测这个概念，说白了就是额外定义一个boolean类型的变量去控制是否走缓存值。如果执行了scheduler这个callback，说明依赖更新(被改变)了，这时候就不应该走缓存，而是该重新去拿getter的最新值，因此现在代码应该这样改改：
``` js
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

初始状态，脏值为true，那么必走effect.run()去拿最新的getter的返回值，随后就把脏值变为false。
而如若依赖没有被改变(没有触发依赖，其实就是指callback的reactive/ref的值没有变),dirty就继续为false，那么这时候get value()就直接return _value，而不是去getter一次再返回，这样就相当于是拿的缓存值。
而如若scheduler这个callback执行了，那么说明触发依赖了，那么就把dirty变为true。而计算属性是get value的时候才去算其值，所以此时去get value，就会去执行getter这个callback，去拿最新的返回值了。









