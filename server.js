const express = require('express');
const PImage = require('pureimage');
const { Solar, Lunar } = require('lunar-javascript');
const path = require('path'); // Import the path module
const app = express();
const port = 3000;

// Use absolute path for the font
const fontPath = path.join(__dirname, 'public', 'simhei.ttf');
PImage.registerFont(fontPath, 'SimHei');
const font = PImage.registerFont(fontPath, 'SimHei');
font.loadSync(); // Synchronously load the font

app.get('/getlunarimg', (req, res) => {
  const width = 400;
const height = 500;
const canvas = PImage.make(width, height);
const ctx = canvas.getContext('2d');

// 设置背景色
ctx.fillStyle = '#F0F8FF'; // 淡蓝色背景
ctx.fillRect(0, 0, width, height);

// 获取日期信息
const solar = Solar.fromDate(new Date());
const lunar = Lunar.fromDate(new Date());

// 绘制标题
ctx.fillStyle = '#4169E1'; // 皇家蓝
ctx.fillRect(0, 0, width, 60);
ctx.fillStyle = '#FFFFFF';
ctx.font = 'bold 28px Arial';
ctx.textAlign = 'center';
ctx.fillText(`${solar.getYear()}年 ${solar.getMonth()}月`, width / 2, 40);

// 绘制边框
ctx.strokeStyle = '#4169E1';
ctx.lineWidth = 3;
ctx.strokeRect(10, 70, width - 20, height - 80);

// 获取特殊日期信息
const shuJiu = lunar.getShuJiu();
const shuJiuString = shuJiu ? shuJiu.toFullString() : 'N/A';
const Fu = lunar.getFu();
const FuString = Fu ? Fu.toFullString() : 'N/A';

// 设置文本样式
ctx.font = '18px Arial';
ctx.fillStyle = '#333333';
ctx.textAlign = 'left';

// 绘制文本
const drawText = (text, x, y) => {
  ctx.fillText(text, x, y);
};

const leftMargin = 20;
drawText(`公历: ${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日 星期${solar.getWeekInChinese()}`, leftMargin, 110);
drawText(`农历: ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`, leftMargin, 150);
drawText(`干支: ${lunar.getYearInGanZhiByLiChun()}年 ${lunar.getMonthInGanZhiExact()}月 ${lunar.getDayInGanZhiExact()}日`, leftMargin, 190);
drawText(`月相: ${lunar.getYueXiang()}`, leftMargin, 230);
drawText(`物候: ${lunar.getWuHou()}`, leftMargin, 270);
drawText(`候: ${lunar.getHou()}`, leftMargin, 310);
drawText(`数九: ${shuJiuString}`, leftMargin, 350);
drawText(`伏: ${FuString}`, leftMargin, 390);

// 绘制装饰线
ctx.strokeStyle = '#4169E1';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(20, 420);
ctx.lineTo(width - 20, 420);
ctx.stroke();

// 绘制底部说明
ctx.font = '14px Arial';
ctx.fillStyle = '#666666';
ctx.textAlign = 'center';
ctx.fillText('中国传统历法 • 节气 • 物候', width / 2, 450);
  // Convert image to PNG format and return
  PImage.encodePNGToStream(canvas, res)
    .then(() => {
      console.log("Image sent to client");
    })
    .catch((e) => {
      console.error("Error sending image: ", e.stack);
      res.status(500).send('Error generating image');
    });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});