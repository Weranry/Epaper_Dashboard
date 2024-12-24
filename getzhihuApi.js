var express = require('express');
var PImage = require('pureimage');
var path = require('path');
var { Readable } = require('stream');
var { fetchAndExtractZhihu } = require('./getWeb/Zhihu/zhihu');
var { generateQRCode } = require('./function/qrcode/qrcode');
//测试
var zhihuImgApi = express.Router();

// 使用绝对路径加载字体
var fontPath = path.join(__dirname, 'public','simhei.ttf');
PImage.registerFont(fontPath, 'SimHei');
var font = PImage.registerFont(fontPath, 'SimHei');
font.loadSync();// 同步加载字体

zhihuImgApi.get('/getzhihuimg', function(req, res) {
    fetchAndExtractZhihu(function(err, zhihuData) {
        if (err) {
            console.error("获取知乎数据失败: ", err);
            res.status(500).send('获取知乎数据失败');
            return;
        }

        generateQRCode(zhihuData.link, function(err, qrBuffer) {
            if (err) {
                console.error("生成二维码失败: ", err);
                res.status(500).send('生成二维码失败');
                return;
            }

            try {
                var width = 400;
                var height = 300;
                var img = PImage.make(width, height);
                var ctx = img.getContext('2d');

                // 设置背景
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, width, height);
                ctx.imageSmoothingEnabled = false;

                // 计算日期相关显示
                var today = new Date();
                var month = today.getMonth() + 1;
                var day = today.getDate();
                var weekDay = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][today.getDay()];
                var dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)) + 1;

                // 绘制月和日
                ctx.fillStyle = 'black';
                ctx.font = '32px SimHei';
                var monthText = month < 10 ? '0' + month : '' + month;
                var dateX = 10;
                var dateY = 50;

                // 计算月份宽度
                var monthWidth = ctx.measureText(monthText).width;

                // 计算分隔符宽度
                var separatorWidth = ctx.measureText('|').width;

                // 计算日期宽度
                ctx.font = '48px SimHei';
                var dayText = day < 10 ? '0' + day : '' + day;
                var dayWidth = ctx.measureText(dayText).width;

                // 计算总宽度和间距
                var totalWidth = monthWidth + separatorWidth + dayWidth;
                var spacing = (100 - totalWidth) / 2; // 假设我们希望整个日期占据100像素宽度

                // 绘制月份
                ctx.font = '32px SimHei';
                ctx.fillText(monthText, dateX, dateY);

                // 绘制分隔符
                var separatorX = dateX + monthWidth + spacing;
                ctx.fillText('|', separatorX, dateY);

                // 绘制日期
                var dayX = separatorX + separatorWidth + spacing;
                ctx.font = '48px SimHei';
                ctx.fillText(dayText, dayX, dateY);

                // 绘制星期
                ctx.font = '16px SimHei';
                ctx.fillText(weekDay, dateX, dateY + 30);

                // 绘制QR码
                var qrX = width - 110;
                var qrY = 10;
                var qrStream = Readable.from(qrBuffer);
                PImage.decodePNGFromStream(qrStream).then(function(qrImage) {
                    ctx.drawImage(qrImage, qrX, qrY, 100, 100);

                    // 绘制标题
                    ctx.fillStyle = 'black';
                    ctx.font = '20px SimHei';
                    var titleX = width / 2;
                    var titleY = height / 2;
                    var lineHeight = 24;
                    var maxWidth = width - 40;
                    var words = zhihuData.title.split('');
                    var line = '';
                    var lines = [];
                    for (var n = 0; n < words.length; n++) {
                        var testLine = line + words[n];
                        var metrics = ctx.measureText(testLine);
                        var testWidth = metrics.width;
                        if (testWidth > maxWidth && n > 0) {
                            lines.push(line);
                            line = words[n];
                        } else {
                            line = testLine;
                        }
                    }
                    lines.push(line);
                    var lineCount = lines.length;
                    var startY = titleY - ((lineCount - 1) * lineHeight / 2);
                    for (var i = 0; i < lineCount; i++) {
                        var text = lines[i];
                        var textWidth = ctx.measureText(text).width;
                        var textX = titleX - (textWidth / 2);
                        ctx.fillText(text, textX, startY + i * lineHeight);
                    }

                    // 绘制今年第多少天
                    ctx.font = '14px SimHei';
                    var dayOfYearText = '知乎好问·今年的第' + dayOfYear + '天';
                    var dayOfYearWidth = ctx.measureText(dayOfYearText).width;
                    var dayOfYearX = (width / 2) - (dayOfYearWidth / 2);
                    var dayOfYearY = height - 10;
                    ctx.fillText(dayOfYearText, dayOfYearX, dayOfYearY);

                    // 设置响应头
                    res.setHeader('Content-Type', 'image/jpeg');

                    // 将图片转换为JPEG格式并发送
                    PImage.encodeJPEGToStream(img, res, 100).then(function() {
                        console.log("JPEG图片已发送给客户端");
                    }).catch(function(error) {
                        console.error("生成JPEG图片时出错: ", error);
                        res.status(500).send('生成JPEG图片时出错');
                    });
                }).catch(function(error) {
                    console.error("处理QR码图片时出错: ", error);
                    res.status(500).send('处理QR码图片时出错');
                });
            } catch (error) {
                console.error("生成图片时出错: ", error);
                res.status(500).send('生成图片时出错');
            }
        });
    });
});

module.exports = zhihuImgApi;

