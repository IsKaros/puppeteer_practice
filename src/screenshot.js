/*
 * @Author: your name
 * @Date: 2021-02-01 10:55:16
 * @LastEditTime: 2021-02-01 14:50:55
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \Puppeteer_test\src\screenshot.js
 */
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    // 是否运行浏览器无头模式
    headless: false,
    // 是否自动打开调试工具(boolean)，若此值为true，headless自动置为fasle
    devtools: false,
    // 设置超时时间(number)，若此值为0，则禁用超时
    timeout: 20000,
    // ? 打开的浏览器最大化
    // ! 但他是iframe引入的，打开的网页也不是全屏的
    // ! 跟viewport有关，默认800*600
    args: ['--start-maximized'],
    // ? null关闭默认viewport,但也还是不是全屏
    // ? 设置了宽度但没设置高度，会报错的
    // ? 现在是写死的，如何动态获取
    defaultViewport: {
      width: 1920,
      height: 1080
    }
  })
  const page = await browser.newPage();
  await page.goto('https://www.taobao.com')
  console.log(page)
  await page.screenshot({
    // ! 文件夹如果不存在是不会主动帮你创建的
    path:'../screenshot/taobao1.png',
    fullPage: true,
  })
  await browser.close()
})()