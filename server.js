const express = require('express');
const PImage = require('pureimage');
const { Solar, Lunar } = require('lunar-javascript');
const app = express();
const port = 3000;

// 在全局作用域中加载字体
PImage.registerFont('./font/simhei.ttf', 'SimHei');
const font = PImage.registerFont('./font/simhei.ttf', 'SimHei');
font.loadSync(); // 同步加载字体

app.get('/getlunarimg', (req, res) => {
  const width = 400;
  const height = 300;
  const canvas = PImage.make(width, height);
  const ctx = canvas.getContext('2d');

  // 设置背景颜色
  ctx.fillStyle = '#FFFFFF'; // 白色背景
  ctx.fillRect(0, 0, width, height);

  // 获取公历和农历日期
  const solar = Solar.fromDate(new Date());
  const lunar = Lunar.fromDate(new Date());
  
  // 获取特殊日子和福
  const shuJiu = lunar.getShuJiu();
  const shuJiuString = shuJiu ? shuJiu.toFullString() : 'N/A';
  const Fu = lunar.getFu();
  const FuString = Fu ? Fu.toFullString() : 'N/A';

  // 设置文本样式
  ctx.font = '20px SimHei';
  ctx.fillStyle = '#000000'; // 黑色文本

  // 绘制文本
  const drawText = (text, x, y) => {
    ctx.fillText(text, x, y);
    ctx.strokeText(text, x, y); // 为了更清晰，绘制文本的轮廓
  };

  drawText(`${solar.getYear()}年`, 10, 30);
  drawText(`${solar.getMonth()}月`, 10, 60);
  drawText(`${solar.getDay()}日`, 10, 90);
  drawText(`星期${solar.getWeekInChinese()}`, 10, 120);

  drawText(`${lunar.getMonthInChinese()}月`, 200, 30);
  drawText(`${lunar.getDayInChinese()}日`, 200, 60);
  drawText(`${lunar.getYearInGanZhiByLiChun()}年`, 200, 90);
  drawText(`${lunar.getMonthInGanZhiExact()}月`, 200, 120);

  drawText(`${lunar.getDayInGanZhiExact()}日`, 320, 30);
  drawText(`${lunar.getYueXiang()}月`, 320, 60);
  drawText(`${lunar.getWuHou()}`, 320, 90);
  drawText(`${lunar.getHou()}`, 320, 120);
  drawText(shuJiuString, 320, 150);
  drawText(FuString, 320, 180);

  // 将图片转换为PNG格式并返回
  PImage.encodePNGToStream(canvas, res)
    .then(() => {
      console.log("Image sent to client");
    })
    .catch((e) => {
      console.log("Error sending image: ", e);
      res.status(500).send('Error generating image');
    });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});