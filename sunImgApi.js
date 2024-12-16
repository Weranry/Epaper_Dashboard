const express = require('express');
const PImage = require('pureimage');
const SunCalc = require('suncalc');
const fs = require('fs');
const path = require('path');

const sunImgApi = express.Router();

const fontPath = path.join(__dirname, 'public', 'simhei.ttf');
PImage.registerFont(fontPath, 'SimHei');
const font = PImage.registerFont(fontPath, 'SimHei');

const iconPath = path.join(__dirname, 'public', 'icons.ttf');
PImage.registerFont(iconPath, 'icons');
const icon = PImage.registerFont(iconPath, 'icons');
font.loadSync();// 同步加载字体
icon.loadSync();


function calculateYPosition(angle) {
    let minY = 100;
    let maxY = 20;
    if (angle === 90) {
        return maxY;
    } else if (angle === 0) {
        return minY;
    } else {
        let ratio = angle / 90;
        return Math.round(maxY + ratio * (minY - maxY));
    }
}

sunImgApi.get('/getsun/:lat/:lon', async (req, res) => {
    const { lat, lon } = req.params;
    const now = new Date();
    const sunTimes = SunCalc.getTimes(now, lat, lon);
    const daylightDurationMs = sunTimes.sunset - sunTimes.sunrise;

    const totalMinutes = Math.floor(daylightDurationMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const solarNoon = sunTimes.solarNoon;
    const sunPosition = SunCalc.getPosition(solarNoon, lat, lon);
    const sunAltitude = Math.round(sunPosition.altitude * 180 / Math.PI * 10) / 10;
    const sunrise = new Date(sunTimes.sunrise).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const sunset = new Date(sunTimes.sunset).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const noon = new Date(solarNoon).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const daylightDuration = `${hours}:${minutes.toString().padStart(2, '0')}`;

    const width = 256;
    const height = 128;
    const canvas = PImage.make(width, height);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // 绘制弧线部分
    let startPoint = { x: 10, y: 100 };
    let endPoint = { x: 246, y: 100 };
    let controlPoint = { x: 128, y: calculateYPosition(sunAltitude) };

    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 计算弧线上的最高点
    const t = 0.5; // 对于对称曲线，最高点在 t=0.5
    const highestX = (1-t)*(1-t)*startPoint.x + 2*(1-t)*t*controlPoint.x + t*t*endPoint.x;
    const highestY = (1-t)*(1-t)*startPoint.y + 2*(1-t)*t*controlPoint.y + t*t*endPoint.y;

    // 在弧线最高处准确画太阳图标
    ctx.fillStyle = 'black';
    ctx.font = '18px icons';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText('', highestX, highestY);

    // 在太阳图标上方显示日中时间和最高高度角
    ctx.fillStyle = 'black';
    ctx.font = '16px SimHei';
    const textToDisplay = `正午${noon} - 高度角: ${sunAltitude}`;
    const textWidth = ctx.measureText(textToDisplay).width;
    ctx.fillText(textToDisplay, highestX, highestY - 18);

    // 在纵向100处画横线并在其下方绘制两条竖线三等分区域
    ctx.beginPath();
    ctx.moveTo(0, 100);
    ctx.lineTo(width, 100);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();

    const thirdWidth = width / 3;
    // 绘制第一条竖线
    ctx.beginPath();
    ctx.moveTo(thirdWidth, 100);
    ctx.lineTo(thirdWidth, height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
    // 绘制第二条竖线
    ctx.beginPath();
    ctx.moveTo(thirdWidth * 2, 100);
    ctx.lineTo(thirdWidth * 2, height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = 'black';
    ctx.font = '20px SimHei';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    const yPosition = (100 + height) / 2;
    const arrowUp = '↑';
    const arrowDown = '↓';

    // Sunrise with up arrow
    ctx.fillText(`${arrowUp} ${sunrise}`, thirdWidth / 2, yPosition);

    // Daylight duration (unchanged)
    ctx.fillText(daylightDuration, thirdWidth * 1.5, yPosition);

    // Sunset with down arrow
    ctx.fillText(`${sunset} ${arrowDown}`, thirdWidth * 2.5, yPosition);

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

module.exports = sunImgApi;

