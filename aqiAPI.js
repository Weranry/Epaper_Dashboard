const express = require('express');
const PImage = require('pureimage');
const { fetchAndExtractaqi } = require('./getWeb/Weather/aqiData');
const path = require('path');
//测试
const aqiImgApi = express.Router();

const fontPath = path.join(__dirname, 'public', 'simhei.ttf');
PImage.registerFont(fontPath, 'SimHei');
const font = PImage.registerFont(fontPath, 'SimHei');

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    if (!text) return y;
    const words = text.split('');
    let line = '';

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n];
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n];
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
    return y + lineHeight;
}

function formatValue(value) {
    if (typeof value === 'number') {
        return value.toFixed(2);
    }
    return value;
}

aqiImgApi.get('/aqi/:location', async (req, res) => {
    const location = req.params.location;
    try {
        const aqiData = await fetchAndExtractaqi(location);
        if (!aqiData) {
            res.status(500).send('获取空气质量数据失败');
            return;
        }

        const width = 400;
        const height = 300;
        const canvas = PImage.make(width, height);
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        // 设置背景色
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // 设置字体
        ctx.fillStyle = '#000000';
        ctx.font = '24px SimHei';

        // 绘制空气质量指数
        if (aqiData.aqivalue) {
            ctx.fillText(aqiData.aqivalue, 20, 40);
        }

        // 绘制各项数值
        const parameters = [
            { name: 'PM2.5', value: aqiData.valuepm25 },
            { name: 'PM10', value: aqiData.valuepm10 },
            { name: 'O3', value: aqiData.valueo3 },
            { name: 'CO', value: aqiData.valueco },
            { name: 'SO2', value: aqiData.valueso2 },
            { name: 'NO2', value: aqiData.valueno2 }
        ];

        ctx.font = '20px SimHei';
        let maxPerRow = Math.floor((width - 40) / 120);
        let y = 80;
        for (let i = 0; i < 6; i++) {
            let x = 20 + (i % maxPerRow) * 120;
            if (i % maxPerRow === 0 && i!== 0) {
                y += 60;
            }
            if (parameters[i].value) {
                ctx.fillText(formatValue(parameters[i].value), x, y);
            }
            ctx.font = '16px SimHei';
            if (parameters[i].name) {
                ctx.fillText(parameters[i].name, x, y + 25);
            }
            ctx.font = '20px SimHei';
        }

        // 绘制描述和建议
        ctx.font = '16px SimHei';
        let descY = height - 60;
        if (aqiData.aqides) {
            descY = wrapText(ctx, aqiData.aqides, 20, descY, width - 40, 20);
        }
        if (aqiData.aqiadvice) {
            descY = wrapText(ctx, aqiData.aqiadvice, 20, descY + 30, width - 40, 20);
        }

        res.setHeader('Content - Type', 'image/jpeg');

        // 转换图像为JPG格式并返回
        PImage.encodeJPEGToStream(canvas, res, 100)
          .then(() => {
                console.log("JPG image sent to client");
            })
          .catch((e) => {
                console.error("Error sending JPG image: ", e.stack);
                res.status(500).send('Error generating JPG image');
            });
    } catch (error) {
        res.status(500).send('获取空气质量数据时发生错误');
    }
});

module.exports = aqiImgApi;