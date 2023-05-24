---
title: koa+web前后端实现chatgpt从发送到接收数据
excerpt: 最简版本，在此基础上可以继续加一些便捷功能
date: 2023-05-24 21:29:43
tags: 综合
categories: 综合
---

> 额....首先你自己得通过某种科学方法获得一个可用的openai-api-key

首先是接口实现，这里我使用koa。

### 方式1： axios, 非stream
``` js
router.get('/chat', async (ctx) => {
  async function getChat(question) {
    const res = await axios({
      method: 'post',
      url: 'https://api.openai.com/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      data: {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: question,
          },
        ],
      },
    })
    return res
  }
  const res = await getChat(ctx.query?.q || '')
  ctx.body = res.data
})
```

下面是使用openai库的api来实现，首先引入：
``` js
const { Configuration, OpenAIApi } = require('openai')

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)
```

### 方式2： openai npm package, 非stream
``` js
router.get('/chat2', async (ctx) => {
  try {
    const question = ctx.query?.q || ''
    const completion = await openai.createChatCompletion({
      // model: 'text-davinci-003', // 这种用openai.createCompletion
      // prompt: question,
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: question,
        },
        {
          role: 'user',
          content: question,
        },
      ],
    })
    ctx.body = completion.data
  }
  catch (e) {
    ctx.body = e
  }
})
```

### 方式3： openai npm package, stream，得以让前端实现打字机效果(不停输出直到结束)
这里我使用koa-sse-stream，先来看一个stream的简单实现：
``` js
// npm i koa-sse-stream
const SSEStream = require('koa-sse-stream')
router.get('/getstream', new SSEStream(), async (ctx) => {
  setInterval(() => {
    ctx.sse.send({
      data: 'This is a SSE message.',
      event: 'message',
      id: Date.now(),
    })
  }, 1000)
})
```

那么结合我们的openai库自带的stream功能，来实现：
``` js
router.get('/chat3', new SSEStream(), async (ctx) => {
  const question = ctx.query?.q || ''
  try {
    // use createCompletion(model version<3.5) or createChatCompletion(with gpt-3.5-turbo)
    const res = await openai.createChatCompletion(
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: question,
          },
        ],
        stream: true,
      },
      { responseType: 'stream' },
    )

    // 监听流并发送数据到SSE流中
    res.data.on('data', (data) => {
      const lines = data
        .toString()
        .split('\n')
        .filter(line => line.trim() !== '')
      for (const line of lines) {
        const message = line.replace(/^data: /, '')
        if (message === '[DONE]')
          return // Stream finished

        try {
          const parsed = JSON.parse(message)
          ctx.sse.send({
            data: parsed.choices[0].delta.content,
            event: 'message',
            id: Date.now(),
          })
        }
        catch (error) {
          ctx.sse.send('Could not JSON parse stream message')
        }
      }
    })
    res.data.on('end', () => {
      ctx.sse.send({ event: 'end' })
    })
  }
  catch (error) {
    if (error.response?.status) {
      ctx.sse.send(error.message)
      error.response.data.on('data', (data) => {
        const message = data.toString()
        try {
          ctx.sse.send(`An error occurred during OpenAI request: ${message}`)
        }
        catch (error) {
          ctx.sse.send(`An error occurred during OpenAI request: ${error}`)
        }
      })
    }
    else {
      ctx.sse.send(`An error occurred during OpenAI request:${error}`)
    }
  }
})
```

这样一个stream的请求就搞定了。

接下来看前端，前两个方式就是正常的请求，没有啥好说了的，能说的是上面的方式3，前端这边使用EventSource来实现：
``` js
const question = 'Who are you?'
let answer = ''
const source = new EventSource(
  `https://xxx.com/chat3?q=${question}`
)
source.addEventListener('message', (event) => {
  answer += event.data
})
source.addEventListener('end', () => {
  source.close()
})
  ```

done.



