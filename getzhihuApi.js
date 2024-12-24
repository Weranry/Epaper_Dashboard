const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const qrcode = require('qrcode');
const PImage = require('pureimage');
const path = require('path');
const { Readable } = require('stream');

const zhihuImgApi = express.Router();

// 使用绝对路径加载字体
const fontPath = path.join(__dirname, 'public','simhei.ttf');
PImage.registerFont(fontPath, 'SimHei');
const font = PImage.registerFont(fontPath, 'SimHei');
font.loadSync();// 同步加载字体

zhihuImgApi.get('/getzhihuimg', async (req, res) => {
    try {
        // 获取知乎日报RSS数据
        const response = await fetch('https://rss.weranry.com/zhihu/daily');
        if (!response.ok) {
            throw new Error('获取RSS数据失败');
        }
        const xmlData = await response.text();

        // 解析XML数据
        const $ = cheerio.load(xmlData, { xmlMode: true });
        const firstItem = $('item').first();
        const title = firstItem.find('title').text();
        const link = firstItem.find('link').text();
        // 创建图片
        const width = 400;
        const height = 300;
        const img = PImage.make(width, height);
        const ctx = img.getContext('2d');

        // 设置背景
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.imageSmoothingEnabled = false;

        // 计算日期相关显示
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const weekDay = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][today.getDay()];
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)) + 1;

        // 生成QR码
        const qrBuffer = await qrcode.toBuffer(link, { width: 100 });
        const qrStream = Readable.from(qrBuffer);
        const qrImage = await PImage.decodePNGFromStream(qrStream);

        // 绘制月和日
        ctx.fillStyle = 'black';
        ctx.font = '32px SimHei';
        let monthText = month < 10? `0${month}` : `${month}`;
        const dateX = 10;
        const dateY = 50;
        ctx.fillText(monthText, dateX, dateY);

        const monthWidth = ctx.measureText(monthText).width;
        const spacing = 5; // 设置间距

        ctx.font = '24px SimHei';
        const separatorX = dateX + monthWidth + spacing;
        ctx.fillText('|', separatorX, dateY);


        ctx.font = '48px SimHei';
        let dayText = day < 10? `0${day}` : `${day}`;
        const dayX = separatorX + ctx.measureText('|').width - ctx.measureText(dayText).width + spacing + 30;
        ctx.fillText(dayText, dayX, dateY);


        // 绘制星期
        ctx.font = '16px SimHei';
        ctx.fillText(weekDay, dateX, dateY + 30);


        // 绘制QR码
        const qrX = width - 110;
        const qrY = 10;
        ctx.drawImage(qrImage, qrX, qrY, 100, 100);

        // 绘制标题
        ctx.fillStyle = 'black';
        ctx.font = '30px SimHei';
        const titleX = (width / 2);
        const titleY = (height / 2 + 20);
        const lineHeight = 24;
        const maxWidth = width - 40;
        const words = title.split('');
        let line = '';
        let lines = [];
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n];
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                lines.push(line);
                line = words[n];
            } else {
                line = testLine;
            }
        }
        lines.push(line);
        const lineCount = lines.length;
        const startY = titleY - ((lineCount - 1) * lineHeight / 2);
        for (let i = 0; i < lineCount; i++) {
            const text = lines[i];
            const textWidth = ctx.measureText(text).width;
            const textX = titleX - (textWidth / 2);
            ctx.fillText(text, textX, startY + i * lineHeight);
        }

        // 绘制今年第多少天
        ctx.font = '14px SimHei';
        const dayOfYearText = `知乎好问·今年的第${dayOfYear}天`;
        const dayOfYearWidth = ctx.measureText(dayOfYearText).width;
        const dayOfYearX = (width / 2) - (dayOfYearWidth / 2);
        const dayOfYearY = height - 10;
        ctx.fillText(dayOfYearText, dayOfYearX, dayOfYearY);

        // 设置响应头
        res.setHeader('Content-Type', 'image/jpeg');

        // 将图片转换为JPEG格式并发送
        await PImage.encodeJPEGToStream(img, res, 100);
        console.log("JPEG图片已发送给客户端");
    } catch (error) {
        console.error("生成JPEG图片时出错: ", error);
        res.status(500).send('生成JPEG图片时出错');
    }
});

module.exports = zhihuImgApi;