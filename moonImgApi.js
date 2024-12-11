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
  const now = new Date();
  const date = new Date(now);

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

  ctx.fillStyle = '#000000';
  ctx.font = '18px SimHei';
  ctx.fillText(date, 10, 20);

  ctx.font = '16px SimHei';

  // 处理月出时间
  let riseName = '月出: ';
  ctx.fillText(riseName, 10, 38);
  let riseValue = moonTimes.rise ? moonTimes.rise.toLocaleTimeString() : 'N/A';
  let riseWidth = ctx.measureText(riseValue).width;
  ctx.fillText(riseValue, 256 - riseWidth - 10, 38);

  // 处理月落时间
  let setName = '月落: ';
  ctx.fillText(setName, 10, 58);
  let setValue = moonTimes.set ? moonTimes.set.toLocaleTimeString() : 'N/A';
  let setWidth = ctx.measureText(setValue).width;
  ctx.fillText(setValue, 256 - setWidth - 10, 58);

  // 处理照明度
  let illumText = '照明度: ';
  let illumValue = `${(moonIllumination.fraction * 100).toFixed(2)}%`;
  let illumWidth = ctx.measureText(illumText).width;
  ctx.fillText(illumText, 10, 78);
  ctx.fillText(illumValue, 256 - ctx.measureText(illumValue).width - 10, 78);

  // 处理距离
  let distanceText = '距离: ';
  let distanceValue = `${Math.round(moonPosition.distance)} km`;
  let distanceWidth = ctx.measureText(distanceText).width;
  ctx.fillText(distanceText, 10, 98);
  ctx.fillText(distanceValue, 256 - ctx.measureText(distanceValue).width - 10, 98);

  // 处理最高角度
  let altitudeText = '最高角度: ';
  let altitudeValue = `${(moonPosition.altitude * 180 / Math.PI).toFixed(2)}°`;
  let altitudeWidth = ctx.measureText(altitudeText).width;
  ctx.fillText(altitudeText, 10, 118);
  ctx.fillText(altitudeValue, 256 - ctx.measureText(altitudeValue).width - 10, 118);

  try {
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

