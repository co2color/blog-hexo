---
title: 手写promise(同步+异步)
excerpt: 手写系列（一）
date: 2022-1-14 21:43:41
tags: js
categories: 前端
---
先直接上代码，再分析。
``` js
const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'
class Pms {
  constructor(executor) {
    this.status = PENDING
    this.resolve_value = undefined
    this.reject_value = undefined
    const resolve = (val) => {
      if (this.status === PENDING) {
        this.status = FULFILLED
        this.resolve_value = val
      }
    }
    const reject = (val) => {
      if (this.status === PENDING) {
        this.status = REJECTED
        this.reject_value = val
      }
    }
    try {
      executor(resolve, reject)
    } catch (err) {
      reject(err)
    }
    // constructor end
  }
  then(onFulfilled, onRejected) {
    if (this.status === FULFILLED) {
      onFulfilled(this.resolve_value)
    }
    if (this.status === REJECTED) {
      onRejected(this.reject_value)
    }
  }
}
const p = new Pms((resolve, reject) => {
  resolve('success resolve')
})
p.then((res) => {
  console.log(res)
})
```
### ps
这篇文章讲怎么实现同步promise，所以你起码应该能会正常使用promise，懂得resolve和reject，懂得.then()会返回个什么东西，等等。
### 代码分析
new Pms传入一个函数参数，再在constructor构造函数接收该参数，并且执行该函数executor()。执行该函数，相当于resolve('success resolve')这里被执行（不知道各位理解得如何，刚开始我卡这里，不太能理解。后来想通了，new Pms这里是把整个函数当作参数传给了构造函数的，那么executor相当于就接收了这整个函数。那么executor()相当于就执行了这个函数。因此resolve('success resolve')被执行），然后执行constructor里的resolve()，将状态从pending变为fulfilled，并将值传过来。
reject同上，不再赘述。
接着，看then部分。因为目前是同步代码，所以当执行then的时候，状态肯定不是pending了(要resolve或者reject后，更新状态，才执行then)，所以then函数就去判断2种状态，接受2个回调函数的参数，把值传过去，因此.then的第一个回调函数的参数res就能拿到resolve过来的字符串'success resolve'了。
### 思考
异步怎么办？比如下面代码
``` js
const p = new Pms((resolve, reject) => {
  // 传入一个异步操作
  setTimeout(() => {
    resolve('成功');
  },1000);
})
p.then(
  (res) => {
    console.log('success', res)
  }
)
```
执行完发现then的第一个函数参数并没有输出结果。这是因为then的时候，状态还是pending，没有触发条件。

好嘞，现在上异步代码。
``` js
const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'
class Pms {
  constructor(executor) {
    this.status = PENDING
    this.resolve_value = undefined
    this.reject_value = undefined
    this.fulfilledTasks = []
    this.rejectedTasks = []
    const resolve = (val) => {
      if (this.status === PENDING) {
        this.status = FULFILLED
        this.resolve_value = val
        this.fulfilledTasks.forEach((fn) => fn())
      }
    }
    const reject = (val) => {
      if (this.status === PENDING) {
        this.status = REJECTED
        this.reject_value = val
        this.rejectedTasks.forEach((fn) => fn())
      }
    }
    try {
      executor(resolve, reject)
    } catch (err) {
      reject(err)
    }
    // constructor end
  }
  then(onFulfilled, onRejected) {
    if (this.status === PENDING) {
      this.fulfilledTasks.push(() => {
        onFulfilled(this.resolve_value)
      })
      this.rejectedTasks.push(() => {
        onRejected(this.reject_value)
      })
    }
    if (this.status === FULFILLED) {
      onFulfilled(this.resolve_value)
    }
    if (this.status === REJECTED) {
      onRejected(this.reject_value)
    }
  }
}
const ps = new Pms((resolve, reject) => {
  setTimeout(() => {
    resolve('success resolve')
  }, 1000)
})
ps.then((res) => {
  console.log(res)
})
```
如上。
分析易得出两段代码不同点在于，多了两个数组，用来存放回调函数。
流程：遇到.then，此时状态还是pending，因此执行pending的if逻辑，将该函数参数push到fulfilledTasks里等待执行。1s后resolve执行，再将fulfilledTasks里的函数执行。
到此，实现了一个初步的promise功能。同时恭喜我们，学到了发布订阅这种设计模式。