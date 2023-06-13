---
title: trojan +私有域名 配置vp埃斯
excerpt: 到底什么是埃斯呢...
date: 2023-06-13 23:05:33
tags: 综合
categories: 综合
---

> 这篇不知道会不会有什么风险，所以如果不懂标题是什么东西的人，还是别看了.....

你需要的东西
1. (clash)[https://github.com/Dreamacro/clash]
2. 一个vp埃斯和一个属于你的域名；

ssl连接服务器后，输入脚本：
``` sh
bash <(curl -sL https://raw.githubusercontent.com/hiifeng/v2ray/main/install_v2ray.sh)
```
其中有很多种方案：
VMESS，即最普通的V2ray服务器，没有伪装，也不是VLESS；
VMESS+TCP+TLS，带伪装的V2ray，不能过CDN中转；
VMESS+WS+TLS，即最通用的V2ray伪装方式，能过CDN中转，推荐使用；
VLESS+TCP+TLS，最通用的VLESS版本，不能过CDN中转，但比VMESS+TCP+TLS方式性能更好；
VLESS+WS+TLS，最通用V2ray伪装的VLESS脚本，能过CDN中转，推荐使用；
VLESS+TCP+XTLS，目前最强悍的VLESS+XTLS组合，强力推荐使用（但是客户端支持没那么好）；
trojan；

在这里我选择trojan，因为clash目前貌似还不支持vless协议...
选择trojan后，继续按照cmd的信息往下走，输入你的域名和一个密码，回车，等待一段时间即可；


然后下载clash的(模板配置文件)[https://vpsgongyi.com/clash_template2.yaml],找到trogan相关的配置项，输入配置(你自己设置的配置，比如port不一定非要是443，取决于你自己设置的是什么)：
``` yaml
# Trojan
- name: "trojan"
  type: trojan
  server: xx.com
  port: 443
  password: your_password
  udp: true
  sni: xx.com
  alpn:
     - h2
     - http/1.1
  ```

然后保存配置文件即可。

然后就是去clash，找到profiles-import-导入该文件，选择该config，然后就可以用了~