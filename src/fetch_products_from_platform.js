/*
 * @Author: your name
 * @Date: 2021-02-01 15:14:49
 * @LastEditTime: 2021-02-01 16:15:57
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \Puppeteer_test\src\fetch_products_from_platform.js
 */
const fs = require('fs');
const puppeteer = require('puppeteer');

// 模拟获取京东的数据，来抓取在售的所有笔记本信息
(async () => {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage();

  // 进入页面
  await page.goto('https://www.jd.com')
  
    // 获取页面标题
    let title = await page.title();
    console.log(title);

    await page.type('#key', '笔记本电脑', { delay: 500 });

    // 点击搜素按钮
    await page.click('.button')

    // 等待页面跳转
    // ? 如果click之后，触发了一个页面跳转，会有一个独立的page.waitForNavigation
    await page.waitForNavigation()

    // 获取当前搜索项商品最大页数，为节约爬取时间，暂只爬取前5页数据
    // const maxPage = await page.evaluate(() => {
    //   return Number($('#bottomPage').attr('max'));
    // })
    const maxPage = 5;
    
    let allInfo = [];
    for(let i = 0; i < maxPage; i++) {
      // 因为京东用了懒加载，所以需要滑动到底部，保证所有商品都加载出来
      // ! 京东真的用了懒加载吗
      await autoScroll(page)
      // * 保证每条商品信息都加载出来
      await page.waitForTimeout(5000);
      const SHOP_LIST_SELECTOR = 'ul.gl-warp.clearfix'
      const shopList = await page.evaluate((sel) => {
        const shopBoxes = Array.from($(sel).find('li div.gl-i-wrap'))
        const items = shopBoxes.map((v) => {
          const name = $(v).find('.p-name').text().trim();
          const price = $(v).find('.p-price').text().trim();
          const shopName = $(v).find('.hd-shopname').text().trim();
          return {
            name,
            price,
            shopName
          }
        })
        return items
      }, SHOP_LIST_SELECTOR)

      allInfo = [...allInfo, ...shopList]

        // 当当前页面并非最大页的时候，跳转到下一页
      if (i < maxPage - 1) {
        // const button = $('#J_bottomPage .p-num .pn-next')
        await page.click('#J_bottomPage .p-num .pn-next');

        // await page.waitForNavigation();
      
        await autoScroll(page);
        // await page.goto(nextPageUrl, { waitUntil:'networkidle0' });
        // waitUntil对应的参数如下：
        // load - 页面的load事件触发时
        // domcontentloaded - 页面的 DOMContentLoaded 事件触发时
        // networkidle0 - 不再有网络连接时触发（至少500毫秒后）
        // networkidle2 - 只有2个网络连接时触发（至少500毫秒后）
      }
    }

    const writeStream = fs.createWriteStream('../files/notebook.json')
    writeStream.write(JSON.stringify(allInfo, undefined, 2), 'utf-8')
    writeStream.end()
    console.log(`共获取到${allInfo.length}台笔记本电脑信息`);
    function autoScroll(page) {
      return page.evaluate(() => {
        return new Promise((resolve) => {
          var totalHeight = 0;
          var distance = 200;
          // * 每200毫秒下滑100像素
          var timer = setInterval(() => {
            var scrollHeight = document.body.scrollHeight
            window.scrollBy(0, distance);
            totalHeight += distance
            if(totalHeight >= scrollHeight){
              clearInterval(timer);
              resolve()
            }
          }, 100);
        })
      })
    }
    await browser.close();
})()
