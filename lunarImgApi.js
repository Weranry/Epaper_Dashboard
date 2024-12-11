const express = require('express');
const PImage = require('pureimage');
const { Solar, Lunar } = require('lunar-javascript');
const path = require('path');

const lunarImgApi = express.Router();

// Use absolute path for the font
const fontPath = path.join(__dirname, 'public','simhei.ttf');
PImage.registerFont(fontPath, 'SimHei');
const font = PImage.registerFont(fontPath, 'SimHei');
font.loadSync(); // Synchronously load the font

lunarImgApi.get('/getlunarimg', (req, res) => {
    const width = 400;
    const height = 300;
    const canvas = PImage.make(width, height);
    const ctx = canvas.getContext('2d');
 
    // 设置背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // 获取日期信息
    const solar = Solar.fromDate(new Date());
    const lunar = Lunar.fromDate(new Date());

    // 获取特殊日期信息
    const shuJiu = lunar.getShuJiu();
    const shuJiuString = shuJiu? shuJiu.toString() : '';
    const fu = lunar.getFu();
    const fuString = fu? fu.toString() : '';

    // 绘制顶部日期
    ctx.fillStyle = '#000000';
    ctx.font = '20px SimHei';
    ctx.fillText(`${solar.getYear()}-${String(solar.getMonth()).padStart(2, '0')}-${String(solar.getDay()).padStart(2, '0')} | 星期${solar.getWeekInChinese()}`, 20, 30);

    // 绘制农历信息
    ctx.fillStyle = '#000000';
    ctx.font = '16px SimHei';
    ctx.fillText(`${lunar.getYearInGanZhi()}年 ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日`, 20, 60);
    ctx.fillText(`${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`, 20, 90);

    // 绘制大日期数字
    ctx.font = '140px SimHei';
    const dayText = String(solar.getDay());
    const dayTextWidth = ctx.measureText(dayText).width;
    ctx.fillText(dayText, (width - dayTextWidth) / 2, (height - 120) / 2 + 120);

    // 绘制底部文字
    ctx.font = '16px SimHei';
    const bottomText = `${lunar.getWuHou()} ${lunar.getHou()}`;
    const bottomTextWidth = ctx.measureText(bottomText).width;
    ctx.fillText(bottomText, (width - bottomTextWidth) / 2, height - 30);

    // 绘制数九或伏
    if (shuJiuString || fuString) {
        ctx.font = '16px SimHei';
        const specialText = shuJiuString || fuString;
        const specialTextWidth = ctx.measureText(specialText).width;
        ctx.fillText(specialText, width - specialTextWidth - 20, 30);
    }

    // Set the content type to JPG
    res.setHeader('Content-Type', 'image/jpeg');

    // Convert image to JPG format and return
    PImage.encodeJPEGToStream(canvas, res, 100)
      .then(() => {
            console.log("JPG image sent to client");
        })
      .catch((e) => {
            console.error("Error sending JPG image: ", e.stack);
            res.status(500).send('Error generating JPG image');
        });
});

module.exports = lunarImgApi;