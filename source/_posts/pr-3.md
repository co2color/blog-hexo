---
title: element-plus 2.8.7 select options为[]导致的bug
excerpt: 通过pr学习源码（3）
date: 2024-11-29 21:30:22
tags: 综合
categories: 综合
---

### 主题：element-plus 2.8.7 select options 为[]导致的 bug

先看复现代码（请使用 v2.8.7），你可用[在线 playground](https://element-plus.run/#eyJBcHAudnVlIjoiPHNjcmlwdCBsYW5nPVwidHNcIiBzZXR1cD5cbmltcG9ydCB7IHJlZiB9IGZyb20gJ3Z1ZSdcblxuY29uc3QgdmFsdWUgPSByZWY8c3RyaW5nW10+KFtdKVxuY29uc3Qgb3B0aW9ucyA9IFtdXG48L3NjcmlwdD5cblxuPHRlbXBsYXRlPlxuICA8ZWwtc2VsZWN0IHYtbW9kZWw9XCJ2YWx1ZVwiIG11bHRpcGxlIGZpbHRlcmFibGUgYWxsb3ctY3JlYXRlIGRlZmF1bHQtZmlyc3Qtb3B0aW9uIDpyZXNlcnZlLWtleXdvcmQ9XCJmYWxzZVwiXG4gICAgc3R5bGU9XCJ3aWR0aDogMjQwcHhcIj5cbiAgICA8ZWwtb3B0aW9uIHYtZm9yPVwiaXRlbSBpbiBvcHRpb25zXCIgOmtleT1cIml0ZW0udmFsdWVcIiA6bGFiZWw9XCJpdGVtLmxhYmVsXCIgOnZhbHVlPVwiaXRlbS52YWx1ZVwiIC8+XG4gIDwvZWwtc2VsZWN0PlxuPC90ZW1wbGF0ZT5cbiIsImVsZW1lbnQtcGx1cy5qcyI6ImltcG9ydCBFbGVtZW50UGx1cyBmcm9tICdlbGVtZW50LXBsdXMnXG5pbXBvcnQgeyBnZXRDdXJyZW50SW5zdGFuY2UgfSBmcm9tICd2dWUnXG5cbmxldCBpbnN0YWxsZWQgPSBmYWxzZVxuYXdhaXQgbG9hZFN0eWxlKClcblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwRWxlbWVudFBsdXMoKSB7XG4gIGlmIChpbnN0YWxsZWQpIHJldHVyblxuICBjb25zdCBpbnN0YW5jZSA9IGdldEN1cnJlbnRJbnN0YW5jZSgpXG4gIGluc3RhbmNlLmFwcENvbnRleHQuYXBwLnVzZShFbGVtZW50UGx1cylcbiAgaW5zdGFsbGVkID0gdHJ1ZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZFN0eWxlKCkge1xuICBjb25zdCBzdHlsZXMgPSBbJ2h0dHBzOi8vY2RuLmpzZGVsaXZyLm5ldC9ucG0vZWxlbWVudC1wbHVzQDIuOC43L2Rpc3QvaW5kZXguY3NzJywgJ2h0dHBzOi8vY2RuLmpzZGVsaXZyLm5ldC9ucG0vZWxlbWVudC1wbHVzQDIuOC43L3RoZW1lLWNoYWxrL2RhcmsvY3NzLXZhcnMuY3NzJ10ubWFwKChzdHlsZSkgPT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpXG4gICAgICBsaW5rLnJlbCA9ICdzdHlsZXNoZWV0J1xuICAgICAgbGluay5ocmVmID0gc3R5bGVcbiAgICAgIGxpbmsuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHJlc29sdmUpXG4gICAgICBsaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgcmVqZWN0KVxuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmQobGluaylcbiAgICB9KVxuICB9KVxuICByZXR1cm4gUHJvbWlzZS5hbGxTZXR0bGVkKHN0eWxlcylcbn0iLCJ0c2NvbmZpZy5qc29uIjoie1xuICBcImNvbXBpbGVyT3B0aW9uc1wiOiB7XG4gICAgXCJ0YXJnZXRcIjogXCJFU05leHRcIixcbiAgICBcImpzeFwiOiBcInByZXNlcnZlXCIsXG4gICAgXCJtb2R1bGVcIjogXCJFU05leHRcIixcbiAgICBcIm1vZHVsZVJlc29sdXRpb25cIjogXCJCdW5kbGVyXCIsXG4gICAgXCJ0eXBlc1wiOiBbXCJlbGVtZW50LXBsdXMvZ2xvYmFsLmQudHNcIl0sXG4gICAgXCJhbGxvd0ltcG9ydGluZ1RzRXh0ZW5zaW9uc1wiOiB0cnVlLFxuICAgIFwiYWxsb3dKc1wiOiB0cnVlLFxuICAgIFwiY2hlY2tKc1wiOiB0cnVlXG4gIH0sXG4gIFwidnVlQ29tcGlsZXJPcHRpb25zXCI6IHtcbiAgICBcInRhcmdldFwiOiAzLjNcbiAgfVxufVxuIiwiUGxheWdyb3VuZE1haW4udnVlIjoiPHNjcmlwdCBzZXR1cD5cbmltcG9ydCBBcHAgZnJvbSAnLi9BcHAudnVlJ1xuaW1wb3J0IHsgc2V0dXBFbGVtZW50UGx1cyB9IGZyb20gJy4vZWxlbWVudC1wbHVzLmpzJ1xuc2V0dXBFbGVtZW50UGx1cygpXG48L3NjcmlwdD5cblxuPHRlbXBsYXRlPlxuICA8QXBwIC8+XG48L3RlbXBsYXRlPlxuIiwiaW1wb3J0LW1hcC5qc29uIjoie1xuICBcImltcG9ydHNcIjoge1xuICAgIFwidnVlXCI6IFwiaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L25wbS9AdnVlL3J1bnRpbWUtZG9tQGxhdGVzdC9kaXN0L3J1bnRpbWUtZG9tLmVzbS1icm93c2VyLmpzXCIsXG4gICAgXCJAdnVlL3NoYXJlZFwiOiBcImh0dHBzOi8vY2RuLmpzZGVsaXZyLm5ldC9ucG0vQHZ1ZS9zaGFyZWRAbGF0ZXN0L2Rpc3Qvc2hhcmVkLmVzbS1idW5kbGVyLmpzXCIsXG4gICAgXCJlbGVtZW50LXBsdXNcIjogXCJodHRwczovL2Nkbi5qc2RlbGl2ci5uZXQvbnBtL2VsZW1lbnQtcGx1c0AyLjguNy9kaXN0L2luZGV4LmZ1bGwubWluLm1qc1wiLFxuICAgIFwiZWxlbWVudC1wbHVzL1wiOiBcImh0dHBzOi8vY2RuLmpzZGVsaXZyLm5ldC9ucG0vZWxlbWVudC1wbHVzQDIuOC43L1wiLFxuICAgIFwiQGVsZW1lbnQtcGx1cy9pY29ucy12dWVcIjogXCJodHRwczovL2Nkbi5qc2RlbGl2ci5uZXQvbnBtL0BlbGVtZW50LXBsdXMvaWNvbnMtdnVlQDIvZGlzdC9pbmRleC5taW4uanNcIlxuICB9LFxuICBcInNjb3Blc1wiOiB7fVxufSIsIl9vIjp7fX0=)来操作：

```html
<script lang="ts" setup>
  import { ref } from "vue";
  const value = ref<string[]>([]);
  const options = [];
</script>

<template>
  <el-select
    v-model="value"
    multiple
    filterable
    allow-create
    default-first-option
    :reserve-keyword="false"
    style="width: 240px"
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>
```

复现步骤：切换到 2.8.7，打开 console，点击 select，输入一个值，然后选中该值，此时控制台会报错：

```
aria.ts:71 Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'value')
```

接下来我们开始定位问题：

1. 我们是在点击某个 option 时触发的这个报错，因此和 click 事件相关，所以我们应该去源码的`<el-option>`组件看看。

2. 从这个报错信息中，最重要的信息就是.value 报错，说明某个变量是 undefined，不小心执行了 undefined.value 导致的异常，所以要去找 xxx.value；

综上，我们来翻看源码，找到 el-option 源码的位置：https://github1s.com/element-plus/element-plus/blob/2.8.7/packages/components/select/src/option.vue：

```html
<template>
  <li
    v-show="visible"
    :id="id"
    :class="containerKls"
    role="option"
    :aria-disabled="isDisabled || undefined"
    :aria-selected="itemSelected"
    @mouseenter="hoverItem"
    @click.stop="selectOptionClick"
  >
    <slot>
      <span>{{ currentLabel }}</span>
    </slot>
  </li>
</template>
```

很好！原来每个 option 就是一个 li 标签实现的，并且我们发现，li 标签确实有一个@click 事件！

接着来看该函数的定义：

```js
import { getCurrentInstance } from 'vue'

const vm = getCurrentInstance().proxy as unknown as SelectOptionProxy

function selectOptionClick() {
  if (!isDisabled.value) {
    select.handleOptionSelect(vm);
  }
}
```

这里调用 handleOptionSelect 传入了 vm，需要解释一下，getCurrentInstance会获取当前组件实例，.proxy就能拿到当前组件定义的data，还有props。比如一个子组件props有 name age两个字段，那么就能用vm.name和vm.age获取到这两个props的值。所以这里vm就会携带label和value等。

接着看 handleOptionSelect 的定义，我们可以发现，handleOptionSelect 定义在 useSelect.ts 中，参数option就是上面的vm：

```js
const handleOptionSelect = (option) => {
  if (props.multiple) {
    const value = ensureArray(props.modelValue ?? []).slice();
    const optionIndex = getValueIndex(value, option);
    if (optionIndex > -1) {
      value.splice(optionIndex, 1);
    } else if (props.multipleLimit <= 0 || value.length < props.multipleLimit) {
      value.push(option.value);
    }
    emit(UPDATE_MODEL_EVENT, value);
    emitChange(value);
    if (option.created) {
      handleQueryChange("");
    }
    if (props.filterable && !props.reserveKeyword) {
      states.inputValue = "";
    }
  } else {
    emit(UPDATE_MODEL_EVENT, option.value);
    emitChange(option.value);
    expanded.value = false;
  }
  focus();
  if (expanded.value) return;
  nextTick(() => {
    scrollToOption(option);
  });
};
```

这段代码里，我们来找触发option.value的地方。可以看到getValueIndex函数第二个参数传入了option，那就来看getValueIndex函数：
``` js
const getValueIndex = (arr: any[] = [], option) => {
  if (!isObject(option?.value)) return arr.indexOf(option.value);

  return arr.findIndex((item) => {
    return isEqual(get(item, props.valueKey), getValueKey(option));
  });
};

```

isObject的定义可以在[点击这里](https://github1s.com/vuejs/core/blob/main/packages/shared/src/general.ts)
``` js
export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object'
```
所以我们翻译一下getValueIndex的if判断和执行：如果option?.value不是一个对象，我们就去获取option.value。
仔细想想有没有问题？

undefined是对象吗？不是，所以该if判断为true，就会执行undefined.value，所以我们看handleOptionSelect函数使用到的第一个option就找到了问题~

这里的修复方式很简单：如果option是undefined，则不执行下面的代码。而getValueIndex这个函数的功能是获取当前选中项的index，这里既然没有数据，自然应该返回<0的结果 ，所以我们可以返回-1作为函数返回值：
``` js
const getValueIndex = (arr: any[] = [], option) => {
  if(option === undefined) return -1; // fix bug line
  if (!isObject(option?.value)) return arr.indexOf(option.value);

  return arr.findIndex((item) => {
    return isEqual(get(item, props.valueKey), getValueKey(option));
  });
};

```