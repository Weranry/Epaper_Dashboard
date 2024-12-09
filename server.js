const express = require('express');
const app = express();
const port = 3000;

const lunarImgApi = require('./lunarImgApi');
const scheduleApi = require('./scheduleApi');

// 使用路由
app.use(lunarImgApi);
app.use(scheduleApi);

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});