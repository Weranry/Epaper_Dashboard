const express = require('express');
const PImage = require('pureimage');
const SunCalc = require('suncalc');
const fs = require('fs');
const path = require('path');

const moonImgApi = express.Router();

// 使用绝对路径加载字体
const fontPath = path.join(__dirname, 'public', 'simhei.ttf');
PImage.registerFont(fontPath, 'SimHei');
const font = PImage.registerFont(fontPath, 'SimHei');
font.loadSync(); // 同步加载字体

// 月相名称映射
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

moonImgApi.get('/getmoon/:lat/:lon', async (req, res) => {
  const { lat, lon } = req.params;
  const date = new Date();

  // 获取月亮信息
  const moonTimes = SunCalc.getMoonTimes(date, parseFloat(lat), parseFloat(lon));
  const moonPosition = SunCalc.getMoonPosition(date, parseFloat(lat), parseFloat(lon));
  const moonIllumination = SunCalc.getMoonIllumination(date);
  const moonPhaseEnglish = getMoonPhaseName(moonIllumination);
  const moonPhaseChinese = moonPhaseMap[moonPhaseEnglish];

  // 创建图像
  const width = 256;
  const height = 128;
  const canvas = PImage.make(width, height);
  const ctx = canvas.getContext('2d');
  

  // 设置背景
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // 绘制文本信息
  ctx.fillStyle = '#000000';
  ctx.font = '12px SimHei';
  ctx.fillText(`月出: ${moonTimes.rise ? moonTimes.rise.toLocaleTimeString() : 'N/A'}`, 10, 20);
  ctx.fillText(`月落: ${moonTimes.set ? moonTimes.set.toLocaleTimeString() : 'N/A'}`, 10, 40);
  ctx.fillText(`照明度: ${(moonIllumination.fraction * 100).toFixed(2)}%`, 10, 60);
  ctx.fillText(`距离: ${Math.round(moonPosition.distance)} km`, 10, 80);
  ctx.fillText(`最高角度: ${(moonPosition.altitude * 180 / Math.PI).toFixed(2)}°`, 10, 100);

  try {
    // 加载并绘制月相图标
   /* const moonPhaseImg = await loadMoonPhaseImage(moonPhaseEnglish);
    if (moonPhaseImg) {
      ctx.drawImage(moonPhaseImg, 180, 10, 60, 60);
    } else {
      ctx.fillText('图标未找到', 180, 40);
    }
*/
    // 绘制月相名称（中文）
    ctx.fillText(moonPhaseChinese, 180, 90);

    // 设置响应头并发送图像
    res.setHeader('Content-Type', 'image/jpeg');

    // 将图像转换为 JPG 格式并返回
    await PImage.encodeJPEGToStream(canvas, res, 100);
    console.log("JPG image sent to client");
  } catch (error) {
    console.error("Error generating or sending image:", error);
    res.status(500).send('Error generating JPG image');
  }
});

module.exports = moonImgApi;

