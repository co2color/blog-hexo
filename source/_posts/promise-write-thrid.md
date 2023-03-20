---
title: 手写promise(手写一的进阶)
excerpt: 手写系列（三）
date: 2022-6-16 22:34:35
tags: js
categories: 前端
---
[手写系列一](https://co2color.github.io/#/detail/67)实现了一个基础版的Promise：
``` js
const ps = new Pms((resolve, reject) => {
  setTimeout(() => {
    resolve('success resolve')
  }, 1000)
})
ps.then((res) => {
  console.log(res)
})
```
但该版本还有缺陷，比如不支持链式调用。
想想链式调用的原理，一个then后面接一个then，那说明每个then都需要return new Promise()，这样下一个then才能正常使用。
因此，重写then方法：
``` js
// 暂时忽略resolvePromise函数，简单理解为该函数会根据情况去resolve()或reject()
function then(onFulfilled, onRejected) {
  onFulfilled =
    typeof onFulfilled === 'function' ? onFulfilled : (value) => value
  onRejected =
    typeof onRejected === 'function'
      ? onRejected
      : (reason) => {
          throw reason
        }
  let promise2 = new MyPromise((resolve, reject) => {
    if (this.status === FULFILLED) {
      setTimeout(() => {
        try {
          let x = onFulfilled(this.value)
          resolvePromise(promise2, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      }, 0)
    }

    if (this.status === REJECTED) {
      setTimeout(() => {
        try {
          let x = onRejected(this.reason)
          resolvePromise(promise2, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      }, 0)
    }
    if (this.status === PENDING) {
      this.onFulfilledCallbacks.push(() => {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      })
      this.onRejectedCallbacks.push(() => {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      })
    }
  })
  return promise2
}
```
接下来需要实现resolvePromise函数：
``` js
function resolvePromise(promise2, x, resolve, reject) {
  if (x === promise2) {
    return reject(
      new TypeError('Chaining cycle detected for promise #<MyPromise>')
    )
  }
  let called = false
  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    let then = x.then
    try {
      if (typeof then === 'function') {
        then.call(
          x,
          (y) => {
            if (called) return
            called = true
            resolvePromise(promise2, y, resolve, reject)
          },
          (r) => {
            if (called) return
            called = true
            reject(r)
          }
        )
      } else {
        resolve(x)
      }
    } catch (e) {
      if (called) return
      called = true
      reject(e)
    }
  } else {
    resolve(x)
  }
}
```
if (x === promise2)的作用是：如果这个promise与返回值x相等，则需要reject这个类型错误（PromiseA+规范所写）。
if ((typeof x === 'object' && x !== null) || typeof x === 'function')：如果x不是一个对象或者函数，那么为普通值直接resolve出去即可。
接下来的判断是：如果then是一个函数则认为x是一个promise对象，然后调用它。并且附带2个参数（函数）处理resolve（参数y）和reject（参数r），如果r和y被多次调用或者对某个函数重复调用，第一次调用优先，其他忽略，因此指定一个全局变量called来控制调用。
如果调用后抛出异常，这个异常可能在调用y或者r函数后造成也可能是在之前就抛出的 因此也需要使用called来控制是否抛出异常。而如果then不是一个函数或者对象，那么确定fulfilled状态resolve出去即可

至此，就可以正常进行链式调用了：
``` js
new Pms((resolve, reject) => {
  resolve('success')
})
  .then((res) => {
    console.log(res)
  })
  .then((res) => {
    console.log(res)
  })
```
完整实现：
``` js
const [PENDING, FULFILLED, REJECTED] = ['PENDING', 'FULFILLED', 'REJECTED']
class MyPromise {
  constructor(executor) {
    this.status = PENDING
    this.value = undefined
    this.reason = undefined
    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []
    const resolve = (value) => {
      if (value instanceof MyPromise) {
        value.then(resolve, reject)
        return
      }
      if (this.status === PENDING) {
        this.status = FULFILLED
        this.value = value
        this.onFulfilledCallbacks.forEach((fn) => fn())
      }
    }
    const reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECTED
        this.reason = reason
        this.onRejectedCallbacks.forEach((fn) => fn())
      }
    }
    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }
  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === 'function' ? onFulfilled : (value) => value
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (reason) => {
            throw reason
          }
    let promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      }

      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      }
      if (this.status === PENDING) {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          })
        })
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason)
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          })
        })
      }
    })
    return promise2
  }
}
function resolvePromise(promise2, x, resolve, reject) {
  if (x === promise2) {
    return reject(
      new TypeError('Chaining cycle detected for promise #<MyPromise>')
    )
  }
  let called = false
  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    let then = x.then
    try {
      if (typeof then === 'function') {
        then.call(
          x,
          (y) => {
            if (called) return
            called = true
            resolvePromise(promise2, y, resolve, reject)
          },
          (r) => {
            if (called) return
            called = true
            reject(r)
          }
        )
      } else {
        resolve(x)
      }
    } catch (e) {
      if (called) return
      called = true
      reject(e)
    }
  } else {
    resolve(x)
  }
}

```