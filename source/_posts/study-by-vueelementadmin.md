---
title: 读vue-element-admin项目之所学
excerpt: 主要是动态权限路由可以说道说道，其他感觉没什么能bb的啦
date: 2022-4-19 23:48:08
tags: js
categories: 前端
---
## 项目源码：[https://github.com/PanJiaChen/vue-element-admin](https://github.com/PanJiaChen/vue-element-admin)
### 动态路由权限管理
首先看src/permission.js，这个是路由权限的核心代码。
```js
router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done() // hack: https://github.com/PanJiaChen/vue-element-admin/pull/2939
    } else {
      // determine whether the user has obtained his permission roles through getInfo
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        next()
      } else {
        try {
          // get user info
          // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
          const { roles } = await store.dispatch('user/getInfo')

          // generate accessible routes map based on roles
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)

          // dynamically add accessible routes
          router.addRoutes(accessRoutes)

          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          next({ ...to, replace: true })
        } catch (error) {
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})
```
解读：
首先拿Cookies里的token值，如果有，说明进入时已经登录。这里分2种情况，1是你进入的是登录页面，那就跳转回首页，首页所有人都有这个路由权限，所以不需要判断；2是你进入的其他页面，那就需要判断你有没有将要进入的这个路由权限。这里通过const hasRoles = store.getters.roles && store.getters.roles.length > 0去vuex里面拿权限。那么你要意识到，如果是页面刷新，这里vuex的数据都是清空了的，那hasRoles势必为flase。因此这里我们就分2种情况，1是用户是刷新页面或者点击登录按钮登录成功后跳转过来的（vuex数据都为空），那么就走else，去请求路由权限store.dispatch('permission/generateRoutes', roles)
。这里想要hasRoles为真，就必须是从某一个路由跳到另外一个路由，比如你现在在/a，你点击了跳转按钮到了/b路由，这里触发router.beforeEach时，vuex里面就是有数据的（在第一次进来之前，先走这里的else，去dispatch permission/generateRoutes拿到数据。然后到了刚才所说，从/a到/b，因此这里的vuex是必然有值的），这里的hasRoles的意思是判断用户是否通过getUserInfo接口去获取了自己的role。如果他通过接口去获取了，这个hasRoles必然为真。
这里如果走else，也就是hasRoles为false的情况，那么继续分析，先通过userInfo接口拿该登录用户的roles，然后去拿该用户能访问的全部路由，然后addRouters添加。
另外，next({ ...to, replace: true })的意思是，如果 addRoutes 并未完成，路由守卫会一层一层的执行执行，直到 addRoutes 完成，找到对应的路由（在addRoutes()之后第一次访问被添加的路由会白屏，这是因为刚刚addRoutes()就立刻访问被添加的路由，然而此时addRoutes()没有执行结束，因而找不到刚刚被添加的路由导致白屏。因此需要从新访问一次路由才行。也就是说，这是用来确保addRoutes()时动态添加的路由已经被完全加载上去，参考：[https://www.cnblogs.com/nirvanan/articles/14338825.html](https://www.cnblogs.com/nirvanan/articles/14338825.html)）
### 动态生成左侧菜单栏sidebar
从/src/layout/components/Sidebar/index.vue可看出，v-for中菜单栏数组叫做permission_routes，通过computed+vuex mapGetters拿到。那么我们就要去看vuex这边的数据：/src/store/modules/permission.js，看到里面有个routers数组。那么这里数据从哪dispatch？固然是从src/permission.js(区分开来，这是两个js，不同路径的哈)的const accessRoutes = await store.dispatch('permission/generateRoutes', roles)而来。
触发后，调用SET_ROUTES，然后执行state.routes = constantRoutes.concat(routes)，将获取的路由数组concat到原路由数组的后面即可。你可以看到运行项目看看，项目中前面几个菜单如/dashboard  /documentation/index和/guide/index都是constantRoutes里面的，而/permission后面的就是异步获取的。
