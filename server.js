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
  const height = 300;
  const canvas = PImage.make(width, height);
  const ctx = canvas.getContext('2d');

  // Set background color
  ctx.fillStyle = '#FFFFFF'; // White background
  ctx.fillRect(0, 0, width, height);

  // Get solar and lunar dates
  const solar = Solar.fromDate(new Date());
  const lunar = Lunar.fromDate(new Date());

  // Draw header
  ctx.fillStyle = '#0000FF'; // Blue header
  ctx.fillRect(0, 0, width, 40);
  ctx.fillStyle = '#FFFFFF'; // White text
  ctx.font = '24px SimHei';
  ctx.fillText(`${solar.getYear()}年 ${solar.getMonth()}月`, 10, 30);

  // Draw borders
  ctx.strokeStyle = '#000000'; // Black border
  ctx.lineWidth = 2;
  ctx.strokeRect(5, 45, width - 10, height - 50);

  // Get special days and Fu
  const shuJiu = lunar.getShuJiu();
  const shuJiuString = shuJiu ? shuJiu.toFullString() : 'N/A';
  const Fu = lunar.getFu();
  const FuString = Fu ? Fu.toFullString() : 'N/A';

  // Set text style
  ctx.font = '18px SimHei';
  ctx.fillStyle = '#000000'; // Black text

  // Draw text with improved alignment
  const drawText = (text, x, y) => {
    ctx.fillText(text, x, y);
  };

  drawText(`公历: ${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日 星期${solar.getWeekInChinese()}`, 10, 70);
  drawText(`农历: ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}日`, 10, 100);
  drawText(`干支: ${lunar.getYearInGanZhiByLiChun()}年 ${lunar.getMonthInGanZhiExact()}月 ${lunar.getDayInGanZhiExact()}日`, 10, 130);
  drawText(`月相: ${lunar.getYueXiang()}`, 10, 160);
  drawText(`物候: ${lunar.getWuHou()}`, 10, 190);
  drawText(`候: ${lunar.getHou()}`, 10, 220);
  drawText(`数九: ${shuJiuString}`, 10, 250);
  drawText(`伏: ${FuString}`, 10, 280);

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