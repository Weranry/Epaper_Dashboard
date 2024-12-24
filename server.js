const express = require('express');
const app = express();
const port = 3000;
const moonImgApi = require('./moonImgApi');
const lunarImgApi = require('./lunarImgApi'); // Added import for lunarImgApi
//const scheduleApi = require('./scheduleApi'); // Added import for scheduleApi
//const sunImgApi = require('./sunImgApi');
const WeatherImgApi = require('./weatherAPI');
//const aqiApi = require('./aqiAPI');
const zhihuApi = require('./getzhihuApi');

app.use(lunarImgApi);
//app.use(scheduleApi);
app.use(moonImgApi);
//app.use(sunImgApi);
app.use(WeatherImgApi);
//app.use(aqiApi);
app.use(zhihuApi);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

