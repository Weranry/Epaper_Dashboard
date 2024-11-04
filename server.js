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
  const img = PImage.make(width, height);
  const ctx = img.getContext('2d');

  // 设置背景
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // 加载字体
  const font = await PImage.registerFont('path/to/simhei.ttf', 'SimHei');
  await font.load();

  // 获取日期信息
  const solar = Solar.fromDate(new Date());
  const lunar = Lunar.fromDate(new Date());

  // 获取特殊日期信息
  const shuJiu = lunar.getShuJiu();
  const shuJiuString = shuJiu ? shuJiu.toString() : '';
  const fu = lunar.getFu();
  const fuString = fu ? fu.toString() : '';

  // 绘制顶部日期
  ctx.fillStyle = '#000000';
  ctx.font = '18px SimHei';
  ctx.fillText(`${solar.getYear()}-${String(solar.getMonth()).padStart(2, '0')}-${String(solar.getDay()).padStart(2, '0')} | 星期${solar.getWeekInChinese()}`, 20, 30);

  // 绘制农历信息
  ctx.fillText(`${lunar.getYearInGanZhi()}年 ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日`, 20, 60);
  ctx.fillText(`${lunar.getMonthInChinese()}${lunar.getDayInChinese()}`, 20, 90);

  // 绘制大日期数字
  ctx.font = 'bold 120px SimHei';
  const dayText = String(solar.getDay()).padStart(2, '0');
  const dayTextWidth = ctx.measureText(dayText).width;
  ctx.fillText(dayText, (width - dayTextWidth) / 2, height / 2);

  // 绘制底部文字
  ctx.font = '18px SimHei';
  const bottomText = `${solar.getJieQi()} ${lunar.getHou()}`;
  const bottomTextWidth = ctx.measureText(bottomText).width;
  ctx.fillText(bottomText, (width - bottomTextWidth) / 2, height - 30);

  // 绘制数九或伏
  if (shuJiuString || fuString) {
    ctx.font = '18px SimHei';
    const specialText = shuJiuString || fuString;
    const specialTextWidth = ctx.measureText(specialText).width;
    ctx.fillText(specialText, width - specialTextWidth - 20, 30);
  }
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