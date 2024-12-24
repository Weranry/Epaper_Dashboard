const express = require('express');
const PImage = require('pureimage');
const SunCalc = require('suncalc');
const fs = require('fs');
const path = require('path');
//测试
const moonImgApi = express.Router();

// 使用绝对路径加载字体
const fontPath = path.join(__dirname, 'public', 'simhei.ttf');
PImage.registerFont(fontPath, 'SimHei');
const font = PImage.registerFont(fontPath, 'SimHei');

const iconPath = path.join(__dirname, 'public', 'icons.ttf');
PImage.registerFont(iconPath, 'icons');
const icon = PImage.registerFont(iconPath, 'icons');
font.loadSync();// 同步加载字体
icon.loadSync();
// 月相名称映射
const mooniconMap = {
    "new_moon": "",
    "waxing_crescent": "",
    "first_quarter": "",
    "waxing_gibbous": "",
    "full_moon": "",
    "waning_gibbous": "",
    "last_quarter": "",
    "waning_crescent": ""
};

const moonPhaseMap = {
    "new_moon": "新月",
    "waxing_crescent": "娥眉月",
    "first_quarter": "上弦月",
    "waxing_gibbous": "盈凸月",
    "full_moon": "满月",
    "waning_gibbous": "亏凸月",
    "last_quarter": "下弦月",
    "waning_crescent": "残月"
};

function getMoonPhaseName(illumination) {
    const phase = illumination.phase;
    if (phase === 0) return "new_moon";
    if (phase < 0.25) return "waxing_crescent";
    if (phase === 0.25) return "first_quarter";
    if (phase < 0.5) return "waxing_gibbous";
    if (phase === 0.5) return "full_moon";
    if (phase < 0.75) return "waning_gibbous";
    if (phase === 0.75) return "last_quarter";
    return "waning_crescent";
}

function loadMoonPhaseImage(phaseName) {
    try {
        const filePath = path.join(__dirname, 'moonicon', `${phaseName}.png`);
        return PImage.decodePNGFromStream(fs.createReadStream(filePath));
    } catch (error) {
        console.error(`Error loading image for ${phaseName}:`, error);
        return null;
    }
}

function adjustDate(date, offsetHours) {
    if (typeof offsetHours!== 'number') {
        throw new Error('offsetHours should be a number');
    }
    date.setHours(date.getHours() + offsetHours);
    return date;
}

moonImgApi.get('/getmoon/:lat/:lon', async (req, res) => {
    const { lat, lon } = req.params;
    const now = new Date();
    const date = adjustDate(new Date(now), 8);

    // 获取月亮信息
    const moonTimes = SunCalc.getMoonTimes(date, parseFloat(lat), parseFloat(lon));
    const moonPosition = SunCalc.getMoonPosition(date, parseFloat(lat), parseFloat(lon));
    const moonIllumination = SunCalc.getMoonIllumination(date);
    const moonPhaseEnglish = getMoonPhaseName(moonIllumination);
    const moonPhaseChinese = moonPhaseMap[moonPhaseEnglish];
    const moonicon = mooniconMap[moonPhaseEnglish];

    // 创建图像
    const width = 256;
    const height = 128;
    const canvas = PImage.make(width, height);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // 设置背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // 绘制分割线
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;

    // 横向分割线
    ctx.beginPath();
    ctx.moveTo(0, height - 25);
    ctx.lineTo(width, height - 25);
    ctx.stroke();

    // 纵向分割线
    const centerX = width / 2;
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height - 25);
    ctx.stroke();

    // 右侧上部分的横向分割线
    ctx.beginPath();
    ctx.moveTo(centerX, (height - 25) / 2);
    ctx.lineTo(width, (height - 25) / 2);
    ctx.stroke();

    // 绘制月相图标和名称
    ctx.fillStyle = '#000000';
    ctx.font = '64px icons';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const leftCenterX = centerX / 2;
    ctx.fillText(moonicon, leftCenterX, (height - 25) / 2 - 12);

    ctx.font = '18px SimHei';
    ctx.fillText(moonPhaseChinese, leftCenterX, (height - 25) / 2 + 40);

    // 绘制月出月落时间
    ctx.font = '16px SimHei';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // 月出时间
    ctx.fillText('↑ '+(moonTimes.rise? moonTimes.rise.toLocaleTimeString('en-US', { hour12: false }) : 'N/A'), 10, height - 10);

    // 月落时间
    const setTimeText =((moonTimes.set? moonTimes.set.toLocaleTimeString('en-US', { hour12: false }) : 'N/A') + '↓ ');
    const setTimeWidth = ctx.measureText(setTimeText).width;
    ctx.textAlign = 'right';
    ctx.fillText(setTimeText, width - 10, height - 10);

    // 绘制照明度
    ctx.textAlign = 'left';
    ctx.font = '18px SimHei';
    const topSectionCenter = (height - 25) / 4;
    ctx.fillText('照明度', centerX + 10, topSectionCenter - 12);
    ctx.fillText(`${(moonIllumination.fraction * 100).toFixed(2)}%`, centerX + 10, topSectionCenter + 15);

    // 绘制距离
    const bottomSectionCenter = ((height - 25) * 3 / 4);
    ctx.fillText('距离', centerX + 10, bottomSectionCenter - 12);
    ctx.fillText(`${Math.round(moonPosition.distance)} km`, centerX + 10, bottomSectionCenter + 15);

    try {
        res.setHeader('Content-Type', 'image/jpeg');

        // 将图像转换为JPG格式并返回
        await PImage.encodeJPEGToStream(canvas, res, 100);
        console.log("JPG image sent to client");
    } catch (error) {
        console.error("Error generating or sending image:", error);
        res.status(500).send('Error generating JPG image');
    }
});

module.exports = moonImgApi;