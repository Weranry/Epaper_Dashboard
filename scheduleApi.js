const express = require('express');
const PImage = require('pureimage');
const path = require('path');

const scheduleApi = express.Router();

const fontPath = path.join(__dirname, 'public','simhei.ttf');
PImage.registerFont(fontPath, 'SimHei');
const font = PImage.registerFont(fontPath, 'SimHei');
font.loadSync(); // Synchronously load the font

// 假设这里的CourseOutput是已经正确获取到的课程输出数据结构
const CourseOutput = require('./course/course.js');

async function generateScheduleImage(courseOutput, res) {
    const img = PImage.make(400, 300);
    const ctx = img.getContext('2d');
   

    // 设置白色背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 400, 300);

    // 根据是否为周末判断颜色
    let color = '#000000';
    if (courseOutput.dateInfo.dayOfWeek === '星期六' || courseOutput.dateInfo.dayOfWeek === '星期日') {
        color = '#FF0000';
    }

    // 绘制顶部矩形
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 400, 50);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18pt SimHei';
    ctx.fillText(`${courseOutput.dateInfo.todayDate}  ${courseOutput.dateInfo.weekNumber} ${courseOutput.dateInfo.dayOfWeek}`, 10, 30);

    // 绘制分割线
    ctx.strokeStyle = color;
    for (let i = 1; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 50 + i * 50);
        ctx.lineTo(400, 50 + i * 50);
        ctx.stroke();
    }

    // 绘制课程表内容
    for (let i = 1; i <= 5; i++) {
        const y = 50 + i * 50 - 25;
        const course = courseOutput.schedule[`course${i}`];
        ctx.fillStyle = '#000000';
        ctx.font = '16pt SimHei';
        let text = '';
        if (course && course.name) {
            text = `${i}:《${course.name}》@${course.room}-${course.teacher}`;
        }
        ctx.fillText(text, 10, y);
    }

    res.setHeader('Content-Type', 'image/jpeg');
    return PImage.encodeJPEGToStream(img, res, 100)
  .then(() => {
            console.log("JPEG image sent to client");
        })
  .catch((e) => {
            console.error("Error sending JPEG image: ", e.stack);
            res.status(500).send('Error generating JPEG image');
        });
}

scheduleApi.get('/schedule', async (req, res) => {
    try {
        const imageStream = await generateScheduleImage(CourseOutput, res);
        imageStream.pipe(res);
    } catch (error) {
        console.error('Error generating schedule image:', error);
        res.status(500).send('Error generating schedule image');
    }
});

module.exports = scheduleApi;