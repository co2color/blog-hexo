---
title: 工作中写过的一些“稀奇古怪”的工具函数
excerpt: JS/TS
date: 2023-06-15 22:27:43
tags: js
categories: 综合
---


### 1.asyncPool
asyncPool用来实现最大并发数同时执行异步请求：
``` js
/**
 * 并发执行异步请求
 * @param {number} poolLimit 最大并发数
 * @param {any} array 请求数组,每项是一个待执行function
 * @param {Function} iteratorFn 迭代器函数，执行array中的每一项
 */
export async function asyncPool(
  poolLimit: number,
  array: any[],
  iteratorFn: Function
) {
  const ret = []
  const executing = [] as any[]
  for (const item of array) {
    const p = Promise.resolve().then(() => iteratorFn(item, array))
    ret.push(p)
    if (poolLimit <= array.length) {
      const e: any = p.then(() => executing.splice(executing.indexOf(e), 1))
      executing.push(e)
      if (executing.length >= poolLimit) {
        await Promise.race(executing)
      }
    }
  }
  return Promise.all(ret)
}

/**
function api(count) {
  return axios.get("http://xx.com", {
    params: { count },
  });
}
asyncPool(2, [1, 1, 1, 1], api);
 */
```

### 2. isNumber
js中判断一个类型是否是number，有很多种方法，给出几种经典实现：
``` js

function isNumber1(num) {
  if (typeof num === "number") {
    return num - num === 0
  }
  if (typeof num === "string" && num.trim() !== "") {
    return Number.isFinite ? Number.isFinite(+num) : isFinite(+num)
  }
  return false
};

function isNumber2(num) {
  return !isNaN(parseFloat(num)) && isFinite(num)
}
```
要注意，该方案会把字符串"123"判定为true。

### 3. compressImage2File(压缩图片)

``` ts
// new Image对象，图片宽，高，文件名,zoom:压缩比例。函数返回File对象
function compressImage2File(
  _img: HTMLImageElement,
  width: number,
  height: number,
  file_name: string,
  imgType: string = "image/jpeg",
  zoom: number = 0.6
) {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
  canvas.width = width
  canvas.height = height
  ctx.drawImage(_img as HTMLImageElement, 0, 0, width, height)
  const fileDataURL = canvas.toDataURL(imgType, zoom)
  let arr: any = fileDataURL.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = window.atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], file_name, { type: mime })
};
```


### 4. getTextWidth(获取文字精确长度)
``` ts
function getTextWidth(text: string, font: string) {
  // re-use canvas object for better performance
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d") as CanvasRenderingContext2D
  context.font = font
  const metrics = context.measureText(text)
  return metrics.width
};
```

该font属性可以用如下方式获取：
``` js
const el = document.getElementById('your_element_id')
const font = window.getComputedStyle(el).getPropertyValue('font')
```

### 5. unique(对象数组根据某个key去重)
``` ts
// 对象数组根据key去重
function unique(arr: any, key: string | number) {
  let obj: any = {}
  let res = []
  return arr.reduce((prev: any, item: any) => {
    obj[item[key]] ? "" : (obj[item[key]] = true && prev.push(item))
    return prev
  }, []);
};
```
比如：
``` js
unique([
  {
    age: 1,
    name: 'a'
  },
  {
    age: 2,
    name: 'b'
  },
  {
    age: 2,
    name: 'c'
  },
], 'age')
// output: 
// [
//   {
//       "age": 1,
//       "name": "a"
//   },
//   {
//       "age": 2,
//       "name": "b"
//   }
// ]
```


### 6. chunk
把一个数组arr按照指定的数组大小size分割成若干个数组块。
``` ts
// 例如:chunk([1, 2, 3, 4], 2) = [[1, 2], [3, 4]]
// 又如:chunk([1, 2, 3, 4, 5], 2) = [[1, 2], [3, 4], [5]];
function chunk(arr: any[], size: number) {
  var objArr = new Array()
  var index = 0
  var objArrLen = arr.length / size
  for (var i = 0; i < objArrLen; i++) {
    var arrTemp = new Array()
    for (var j = 0; j < size; j++) {
      arrTemp[j] = arr[index++]
      if (index == arr.length) {
        break
      }
    }
    objArr[i] = arrTemp
  }
  return objArr
}
```

### 7. randomString
``` ts
// 随机生成字符串，如果在list中，则重新生成(list: return conditionList的map(id))
function randomString(len: number, list: string[]): string {
  len = len || 32
  const $chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678"
  const maxPos = $chars.length
  let res = ""
  for (let i = 0; i < len; i++) {
    res += $chars.charAt(Math.floor(Math.random() * maxPos))
  }
  // 存在则重新生成
  if (list.includes(res)) {
    return randomString(len, list)
  }
  return res;
}
```
该函数经常用于vue中点击按钮新加一个项时，需要bind key避免dom更新混乱。因为你纯新建的时候，有时候一个list会没有唯一值，而用index当key显然是不可取的，那么就手动生成唯一key。第二个参数是个数组，为了避免生成的key在之前已经存在过（虽然这概率比你中彩票还小，但，严格点总不是坏事~）


### 8. getLadderArr
给定大小a-b范围，给定一个等差额度，返回一个数组，长度为c，数组中的值为a-b范围内的等差值.
比如给定[1,10]，等差额度为3， 就返回[1, 5.5, 10]
``` ts
function getLadderArr(a: number, b: number, c: number) {
  let arr: number[] = []
  if (c === 1) {
    arr = [(a + b) / 2]
  } else {
    const diff = (b - a) / (c - 1)
    for (let i = 0; i < c; i++) {
      arr.push(a + diff * i)
    }
  }

  return arr.map((item) => {
    // 如果是整型直接返回，如果是浮点数保留两位小数
    return Number.isInteger(item) ? item : +item.toFixed(2)
  })
}
```


### 9. sortArrayOfObjects(对象数组排序函数，按指定键对对象数组进行排序)
``` ts
/**
 * 对象数组排序函数，按指定键对对象数组进行排序
 * @param arr 要排序的对象数组
 * @param key 要按其排序的键
 * @param order 排序顺序，默认为升序（'asc'）；也可以指定为降序（'desc'）
 * @returns 排序后的对象数组
 */
type ObjectWithSortableValue<T> = {
  [K in keyof T]: T[K] extends number | string ? T[K] : never
};

export function sortArrayOfObjects<T>(
  arr: T[],
  key: keyof ObjectWithSortableValue<T>,
  order: "asc" | "desc" = "asc"
): T[] {
  arr.sort((a, b) => {
    const valueA = a[key]
    const valueB = b[key]

    // 如果键的值是字符串类型，使用 localeCompare 方法进行排序
    if (typeof valueA === "string" && typeof valueB === "string") {
      return order === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA)
    }

    // 如果键的值是数字类型，使用减法运算符进行排序
    return order === "asc"
      ? (valueA as number) - (valueB as number)
      : (valueB as number) - (valueA as number)
  });

  return arr
}
```

### 10. calculateLength
计算字符串长度，中文2个长度，英文1个长度
``` ts
export function calculateLength(str: string): number {
  let length = 0
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i)
    if (
      (charCode >= 0 && charCode <= 128) ||
      (charCode >= 0xff00 && charCode <= 0xffff)
    ) {
      length += 1 // 英文、数字、标点符号等占1个长度
    } else {
      length += 2 // 中文占2个长度
    }
  }
  return length
}
```

(可能)未完待续....