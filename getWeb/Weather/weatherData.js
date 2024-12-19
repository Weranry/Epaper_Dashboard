const fetch = require('node-fetch');
const cheerio = require('cheerio');

// 这个函数用于从给定的URL中提取天气数据并返回JSON格式
async function fetchAndExtractWeather(location) {
    const url = `https://www.qweather.com/weather/${location}.html`;
    try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);
        const weatherInfoDiv = $('.l-page-city-weather__current');

        const currentTime = weatherInfoDiv.find('.current-time').text().trim();
        const temperature = weatherInfoDiv.find('.current-live__item p:first-child').text().trim();
        const weatherCondition = weatherInfoDiv.find('.current-live__item p:nth-child(2)').text().trim();
        //const aqi = weatherInfoDiv.find('.air-tag').text().trim();
        const tonightForecast = weatherInfoDiv.find('.current-abstract').text().trim();
        const windLevel = weatherInfoDiv.find('.current-basic___item p:first-child').eq(0).text().trim();
        const windDirection = weatherInfoDiv.find('.current-basic___item p:nth-child(2)').eq(0).text().trim();
        const humidity = weatherInfoDiv.find('.current-basic___item p:first-child').eq(1).text().trim();
        const feelsLikeTemperature = weatherInfoDiv.find('.current-basic___item p:first-child').eq(3).text().trim();
        //const visibility = weatherInfoDiv.find('.current-basic___item p:first-child').eq(4).text().trim();
        const precipitation = weatherInfoDiv.find('.current-basic___item p:first-child').eq(5).text().trim();
        const atmosphericPressure = weatherInfoDiv.find('.current-basic___item p:first-child').eq(6).text().trim();

        return {
            "当前时间": currentTime,
            "温度": temperature,
            "天气状况": weatherCondition,
            //"AQI": aqi,
            "今晚预报": tonightForecast,
            "风力等级": windLevel,
            "风向": windDirection,
            "湿度": humidity,
            "体感温度": feelsLikeTemperature,
            //"能见度": visibility,
            "降水量": precipitation,
            "大气压": atmosphericPressure
        };
    } catch (error) {
        console.error('获取或解析HTML时出错:', error);
        return null;
    }
}

module.exports = {
    fetchAndExtractWeather
};