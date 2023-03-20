---
title: canvas draw 画笔小玩具
excerpt: canvas+mouse/touch事件分别做pc/移动端
date: 2022-01-10 21:32:43
tags: js
categories: 前端
---
### 使用canvas做一个兼容pc/h5的画板。

前置知识：canvas、事件捕获和冒泡、UI事件mouse/touch。

首先创建一个画布

```javascript
<canvas id="canvas" width="400" height="400"></canvas>
<script>
  const ctx = canvas.getContext('2d')
  ctx.strokeStyle = 'pink'
  ctx.lineWidth = 1
  ctx.fillStyle = '#eee'
  ctx.fillRect(0, 0, 400, 400)
</script>

```

然后实现pc端各个mouse事件：

```javascript
let drawing = false
let x = 0,
  y = 0
canvas.addEventListener('mousedown', (e) => {
  drawing = true
  x = e.x
  y = e.y
  ctx.moveTo(x, y)
  ctx.lineTo(x + 1, y + 1)
  ctx.stroke()
  ctx.beginPath()
})
canvas.addEventListener('mousemove', (e) => {
  if (drawing) {
    e && e.preventDefault()
    ctx.moveTo(x, y)
    x = e.x
    y = e.y
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
  }
})
canvas.addEventListener('mouseup', (e) => {
  console.log('end', e)
  drawing = false
})
canvas.addEventListener('mouseleave', (e) => {
  console.log('leave', e)
  drawing = false
})
```

移动端touch事件：

```javascript
canvas.addEventListener('touchstart', (e) => {
  console.log('touchstart', e)
  drawing = true
  x = e.touches[0].pageX - e.touches[0].target.offsetLeft
  y = e.touches[0].pageY - e.touches[0].target.offsetTop
  ctx.moveTo(x, y)
  ctx.lineTo(x + 1, y + 1)
  ctx.stroke()
  ctx.beginPath()
})
canvas.addEventListener('touchmove', (e) => {
  console.log('touchmove', e)
  if (drawing) {
    e && e.preventDefault()
    ctx.moveTo(x, y)
    x = e.touches[0].pageX - e.touches[0].target.offsetLeft
    y = e.touches[0].pageY - e.touches[0].target.offsetTop
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
  }
})
canvas.addEventListener('touchend', (e) => {
  console.log('touchend', e)
  drawing = false
})
```

当然了，这里需要判断是pc还是h5，可参考如下代码：

```javascript
const isPc = () => {
  const userAgentInfo = navigator.userAgent.toLowerCase()
  const agents = [
    'android',
    'iphone',
    'symbianos',
    'windows phone',
    'ipad',
    'ipod',
  ]
  let flag = true
  for (var v = 0; v < agents.length; v++) {
    if (userAgentInfo.indexOf(agents[v]) > 0) {
      flag = false
      break
    }
  }
  return flag
}
```
完整代码：[https://github.com/co2color/js-canvas-draw](https://github.com/co2color/js-canvas-draw)
demo：[https://cococolor.cc/draw](https://cococolor.cc/draw)