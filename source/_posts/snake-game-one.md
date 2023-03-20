---
title: 贪吃蛇（小游戏系列一）
excerpt: vue3 canvas 贪吃蛇
date: 2022-9-10 02:05:39
tags: js
categories: 前端
---
## 贪吃蛇 
可以先看[完整代码](https://github.com/co2color/games-vue3/blob/main/src/views/snake/snake.vue)，粗略扫一遍先。这篇仅仅用于轻度解释逻辑。
贪吃蛇最核心的就是蛇的移动：每次移动时，删除数组最后一个&&数组首插入一个，其实就是pop和unshift。
一步一步来。
### 定义基础数据
创建canvas context对象，定义画布的宽度高度，以及每个格子的宽高SIZE。
foodCanInBorder是用来判断生成的食物是否在最边上,在getRandomFoodLocation函数里写判断逻辑，return {x, y}（不重要，可以忽视）。
initSnakeList是蛇的数组，这里需要注意一点，初始化x依次为30,31,31, 30是蛇头，那么这条蛇初始移动应该是从右向左，因此currentLocation默认为KeyA(WSAD,A代表左 )。
t用来存计时器。
``` js
const canvas = ref<HTMLCanvasElement | null>(null)
const context = ref<CanvasRenderingContext2D | null>(null)
const btn = ref<HTMLButtonElement | null>(null)
const WIDTH = 500,
  HEIGHT = 500,
  SIZE = 10
const foodCanInBorder = ref(false)
const initSnakeList = [
  { x: 30, y: 25 },
  { x: 31, y: 25 },
  { x: 32, y: 25 }
]
let t = 0
const snakeList = ref(cloneDeep(initSnakeList))
const currentLocation = ref('KeyA')
const getRandomFoodLocation = (_foodCanInBorder: Boolean = false) => {
  let x = Math.floor((Math.random() * WIDTH) / SIZE),
    y = Math.floor((Math.random() * HEIGHT) / SIZE)
  if (_foodCanInBorder) {
    return { x, y }
  }
  if (x === 0) {
    x += 1
  } else if (y === 0) {
    y += 1
  } else if (x === WIDTH / SIZE - 1) {
    x -= 1
  } else if (y === HEIGHT / SIZE - 1) {
    y -= 1
  }
  return { x, y }
}
const foodLocation = ref({
  x: getRandomFoodLocation(foodCanInBorder.value).x,
  y: getRandomFoodLocation(foodCanInBorder.value).y
})
```
------------------------------------
### 初始化画布
这个很简单，需要注意的是，dom需要在onMounted周期钩子内获取。
``` js
const canvasInit = () => {
  canvas.value!.width = WIDTH
  canvas.value!.height = HEIGHT
  context.value = canvas.value!.getContext('2d')
}
onMounted(() => {
  canvasInit()
})
```
------------------------------------
### 渲染数据到canvas画布
使用canvas的`fillStyle`和`fillRect`即可。
``` js
const renderItem = (color: string, x: number, y: number) => {
  context.value!.fillStyle = color
  context.value!.fillRect(x * SIZE, y * SIZE, SIZE, SIZE)
}
const renderFood = (color: string = 'skyblue') => {
  renderItem(color, foodLocation.value.x, foodLocation.value.y)
}
const renderSnake = () => {
  snakeList.value.forEach(item => {
    renderItem('pink', item.x, item.y)
  })
}
```
------------------------------------
### 判断逻辑
判断是否吃到食物：
``` js
const isEatFood = () => {
  const headItem = snakeList.value[0]
  if (headItem.x === foodLocation.value.x && headItem.y === foodLocation.value.y) {
    return true
  }
  return false
}
```
如果吃到了食物，需要重置食物：
``` js
const resetFood = () => {
  const { x, y } = getRandomFoodLocation(foodCanInBorder.value)
  foodLocation.value = { x, y }
  renderFood()
}
```
蛇是否撞墙：
``` js
const touchWallWatch = () => {
  const headItem = snakeList.value[0]
  if (headItem.y === -1 || headItem.y === HEIGHT / SIZE || headItem.x === -1 || headItem.x === WIDTH / SIZE) {
    return true
  }
  return false
}
```
撞墙后的逻辑，自由发挥：
``` js
const touchCallBack = () => {
  alert('砰恰拉卡')
  btn.value!.innerText = 'restart'
  removeKeyBoardWatch() // 看下面的函数，移除键盘监听
}
```
------------------------------------
### 移动蛇
首先需要写键盘监听，这个很简单：
``` js
const watchKeyCallBack = (event: KeyboardEvent) => {
  if (event.code === 'KeyW') currentLocation.value = 'KeyW'
  if (event.code === 'KeyS') currentLocation.value = 'KeyS'
  if (event.code === 'KeyA') currentLocation.value = 'KeyA'
  if (event.code === 'KeyD') currentLocation.value = 'KeyD'
}
const addKeyBoardWatch = () => {
  document.addEventListener('keydown', watchKeyCallBack)
}
const removeKeyBoardWatch = () => {
  document.removeEventListener('keydown', watchKeyCallBack)
}
```
移动蛇，如果撞墙，游戏结束，清空t。否则按照上下左右去重新生成蛇头。如果吃到食物，就重置食物。如果没有吃到食物，则删除蛇数组的最后一个item（前面add了head item，这里delete last item，因此蛇总长度保持不变，游戏继续。）
``` js
const moveSnake = () => {
  if (touchWallWatch()) {
    touchCallBack()
    clearInterval(t)
    return
  }
  if (currentLocation.value === 'KeyW') {
    snakeList.value.unshift({
      x: snakeList.value[0].x,
      y: snakeList.value[0].y - 1
    })
  } else if (currentLocation.value === 'KeyA') {
    snakeList.value.unshift({
      x: snakeList.value[0].x - 1,
      y: snakeList.value[0].y
    })
  } else if (currentLocation.value === 'KeyS') {
    snakeList.value.unshift({
      x: snakeList.value[0].x,
      y: snakeList.value[0].y + 1
    })
  } else if (currentLocation.value === 'KeyD') {
    snakeList.value.unshift({
      x: snakeList.value[0].x + 1,
      y: snakeList.value[0].y
    })
  }
  if (isEatFood()) {
    resetFood()
  } else {
    snakeList.value.pop()
  }
}
```
------------------------------------
### 开始游戏
开始之前先重置一下。当然，这里可以优化，我图省事。
然后addKeyBoardWatch注册键盘监听。每次移动，先清空画布，然后render蛇和食物，然后移动蛇。不断重复这个过程。
``` js
const startGame = () => {
  restartGame()
  addKeyBoardWatch()
  t = setInterval(() => {
    context.value!.clearRect(0, 0, WIDTH, HEIGHT)
    renderSnake()
    renderFood()
    moveSnake()
  }, 100)
}
```




