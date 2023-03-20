---
title: test
date: 2023-03-20 17:51:48
tags:
---

``` js
import { shallowReadonly } from '../reactivity/reactive'
import { emit } from './componentEmit'
import { initProps } from './componentProps'
import { PublicInstanceProxyHandlers } from './componentPublicInstance'
import { initSlots } from './componentSlots'

export function createComponentInstance(vnode, parent) {
  const component = {
    vnode,
    type: vnode.type,
    props: {},
    setupState: {},
    emit: () => {},
    slots: {},
    provides: parent ? parent.provides : {},
    parent,
    // isMounted: false,
  }
  component.emit = emit.bind(null, component) as any // 第一个参数是this，第二个参数是用户传入的参数
  return component
}

export function setupComponent(instance) {
  // ...
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  const Component = instance.vnode.type
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

  const { setup } = Component

  if (setup) {
    setCurrentInstance(instance)
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    })
    setCurrentInstance(null)
    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult) {
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult
  }
  finishComponentSetup(instance)
}
function finishComponentSetup(instance: any) {
  const Component = instance.type
  instance.render = Component.render
}

let currentInstance: any = null

export function getCurrentInstance() {
  return currentInstance
}
// set
export function setCurrentInstance(instance) {
  currentInstance = instance
}
```
## asdasd2

<<<<<<< HEAD
### haha3
=======


``` javascript
const b = 2
```
>>>>>>> 205b89ccca394fb91f7494ff76a802e74556ac2c
