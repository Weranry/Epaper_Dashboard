const express = require('express');
const app = express();
const SunCalc = require('suncalc');
const testapi = express.Router();
// 计算当前的UTC时间
function getCurrentUTCTime() {
    const now = new Date();
    const utcTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    return utcTime;
}

// 根据偏移量调整UTC时间
function adjustUTCTime(utcTime, offset) {
    const adjustedTimeInMilliseconds = utcTime.getTime() + offset * 3600000;
    const adjustedUTCTime = new Date(adjustedTimeInMilliseconds);
    return adjustedUTCTime;
}

// 格式化时间为HH:mm格式
function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

app.get('/test', (req, res) => {
    const currentUTCTime = getCurrentUTCTime();
    const offset = 8;
    const adjustedUTCTime = adjustUTCTime(currentUTCTime, offset);
    const latitude = 40.82;
    const longitude = 111.65;

    const sunTimes = SunCalc.getTimes(adjustedUTCTime, latitude, longitude);

    const response = {
        "originalUTCTime": formatTime(currentUTCTime),
        "adjustedUTCTime": formatTime(adjustedUTCTime),
        "sunriseTime": formatTime(sunTimes.sunrise),
        "sunsetTime": formatTime(sunTimes.sunset)
    };

    res.json(response);
});
module.exports = testapi;