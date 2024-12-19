const express = require('express');
const PImage = require('pureimage');
const { fetchAndExtractWeather } = require('./getWeb/Weather/weatherData');
const path = require('path');

const WeatherImgApi = express.Router();

const fontPath = path.join(__dirname, 'public', 'simhei.ttf');
PImage.registerFont(fontPath, 'SimHei');
const font = PImage.registerFont(fontPath, 'SimHei');
const iconPath = path.join(__dirname, 'public', 'icons.ttf');
PImage.registerFont(iconPath, 'icon');
const icon = PImage.registerFont(iconPath, 'icon');
font.loadSync();
icon.loadSync();

// 根据天气状况选择图标
function getWeatherIcon(condition) {
    const iconMap = {
        '晴': '',
        '多云': '',
        '少云': '',
        '晴间多云': '',
        '阴': '',
        '阵雨': '',
        '强阵雨': '',
        '雷阵雨': '',
        '强雷阵雨': '',
        '雷阵雨伴有冰雹': '',
        '小雨': '',
        '中雨': '',
        '大雨': '',
        '极端降雨': '',
        '毛毛雨/细雨': '',
        '暴雨': '',
        '大暴雨': '',
        '特大暴雨': '',
        '冻雨': '',
        '小到中雨': '',
        '中到大雨': '',
        '大到暴雨': '',
        '暴雨到大暴雨': '',
        '大暴雨到特大暴雨': '',
        '小雪': '',
        '中雪': '',
        '大雪': '',
        '暴雪': '',
        '雨夹雪': '',
        '雨雪天气': '',
        '阵雨夹雪': '',
        '阵雪': '',
        '小到中雪': '',
        '中到大雪': '',
        '大到暴雪': '',
        '雪': '',
        '薄雾': '',
        '雾': '',
        '霾': '',
        '扬沙': '',
        '浮尘': '',
        '沙尘暴': '',
        '强沙尘暴': '',
        '浓雾': '',
        '强浓雾': '',
        '中度霾': '',
        '重度霾': '',
        '严重霾': '',
        '大雾': '',
        '特强浓雾': '',
        '热': '',
        '冷': '',
        '未知': ''
    };

    let iconChar = '';

    for (const [key, value] of Object.entries(iconMap)) {
        if (condition.includes(key)) {
            iconChar = value;
            break;
        }
    }

    return iconChar;
}

function wrapText(ctx, text, maxWidth) {
    const words = text.split('');
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const width = ctx.measureText(currentLine + words[i]).width;
        if (width < maxWidth) {
            currentLine += words[i];
        } else {
            lines.push(currentLine);
            currentLine = words[i];
        }
    }
    lines.push(currentLine);
    return lines;
}

WeatherImgApi.get('/weather/:location', async (req, res) => {
    const location = req.params.location;
    const weatherData = await fetchAndExtractWeather(location);

    const width = 400;
    const height = 300;
    const canvas = PImage.make(width, height);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // 设置背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);


    // 绘制天气图标 (靠左, y=60)
    ctx.fillStyle = '#000000';
    ctx.font = '80px icon';
    const iconChar = getWeatherIcon(weatherData['天气状况']);
    ctx.fillText(iconChar, 130, height / 2 - 50); // 垂直居中

    // 绘制天气状况和温度
    ctx.font = '40px SimHei';
    const weatherText = weatherData['天气状况'];
    ctx.font = '30px SimHei';
    const tempText = weatherData['温度'];
    
    // 计算文本宽度以确保对齐
    const weatherWidth = ctx.measureText(weatherText).width;
    const tempWidth = ctx.measureText(tempText).width;
    const maxTextWidth = Math.max(weatherWidth, tempWidth);
    
    const textStartX = 175; // 图标右侧的起始位置
    
    // 绘制天气状况（上面）
    ctx.fillText(weatherText, textStartX + (maxTextWidth - weatherWidth) / 2 + 60, height / 2 - 80);
    
    // 绘制温度（下面）
    ctx.fillText(tempText, textStartX + (maxTextWidth - tempWidth) / 2 + 65 , height / 2 - 50);

    // 绘制天气描述
    ctx.font = '18px SimHei';
    const descriptionLines = wrapText(ctx, weatherData['今晚预报'], width - 40);
    let y = 160;
    descriptionLines.forEach(line => {
        const lineWidth = ctx.measureText(line).width;
        ctx.fillText(line, (width - lineWidth) / 2, y);
        y += 25;
    });

    // 绘制底部四个参数
    const paramWidth = width / 4;
    const params = [
        { value: weatherData['风向'] + weatherData['风力等级'], label: '风向' },
        { value: weatherData['湿度'], label: '相对湿度' },
        { value: weatherData['体感温度'], label: '体感温度' },
        { value: weatherData['大气压'], label: '大气压' }
    ];


    params.forEach((param, index) => {
        const x = index * paramWidth + paramWidth / 2;
        ctx.font = '20px SimHei';
        const valueWidth = ctx.measureText(param.value).width;
        ctx.fillText(param.value, x - valueWidth / 2, 260);
        
        // 绘制标签
        ctx.font = '16px SimHei';
        const labelWidth = ctx.measureText(param.label).width;
        ctx.fillText(param.label, x - labelWidth / 2, 285);
    });

    res.setHeader('Content-Type', 'image/jpeg');

    // 转换图像为JPG格式并返回
    PImage.encodeJPEGToStream(canvas, res, 100)
        .then(() => {
            console.log("JPG image sent to client");
        })
        .catch((e) => {
            console.error("Error sending JPG image: ", e.stack);
            res.status(500).send('Error generating JPG image');
        });
});

module.exports = WeatherImgApi;

