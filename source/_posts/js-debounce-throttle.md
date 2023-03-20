---
title: 防抖和节流
excerpt: 手写系列（二）
date: 2022-2-21 22:16:47
tags: js
categories: 前端
---
如果你看不懂很多博客所说的关于防抖节流的概念，那就看我直接用例子描述：
**防抖例子**：搜索框输入，你疯狂不停输入很多个字符时，只有等你停止输入了，才会执行查找方法。这里就不适合用节流，如果用节流，间隔3秒，那么你如果要10秒才能输入完你的问题，就会在3 6 9s的时候执行了总共三次的查找方法，有必要吗？没必要。这里你可以把防抖的时间设置为1s，那么1s内你在疯狂输入字符，就不会执行函数。而你1s没有输入的动静。就会执行方法。
也就是说，防抖就是在疯狂进行操作时，最终只会触发最后一次操作的这么一个概念。
``` js
<body>
  <div
    id="divs"
    style="width: 200px; height: 200px; background-color: skyblue"
  ></div>
  <script>
    function dos(e) {
      console.log(e)
    }
    function debounce(func, timeOut) {
      let timer = null
      return function () {
        let args = arguments // 获取参数
        clearTimeout(timer)
        timer = setTimeout(() => {
          func.apply(this, args)
        }, timeOut)
      }
    }
    let debounceLog = debounce(dos, 500)
    divs.addEventListener('mousemove', () => {
      debounceLog(123)
    })
  </script>
</body>
```
**节流例子**：鼠标左键点击一个按钮，3s执行一次按钮注册的方法。你每秒都在疯狂点击该按钮，但10秒只会在3 6 9s触发总共3次该方法。
也就是说，节流就是在疯狂进行操作时，间隔你设置的时间去执行操作的这么一个概念(执行次数 = 总时长 % 间隔时间，如总时长22秒，间隔时长3秒，那么会在3x7=21秒内执行7次，第21+3=24秒执行第8次，然后结束。)
``` js
function throttle(fun, time) {
  let t1 = 0 // init time
  return function () {
    let t2 = new Date() // current time
    if (t2 - t1 > time) {
      fun.apply(this, arguments)
      t1 = t2
    }
  }
}
```
最后再总结一次：
防抖：玩王者的你疯狂点回城按钮想嘲讽对面（懒得数你点几次哦，反正最后一次才能回去）。
节流：玩王者的你疯狂戳屏幕想释放技能（懒得数你点几次哦，反正下一次到了技能的间隔释放时间后我才执行）。