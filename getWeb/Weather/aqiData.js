const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function fetchAndExtractaqi(location) {
    const url = `https://www.qweather.com/air/${location}.html`;
    try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);
        const airInfoDiv = $('.l-page-city-air__current');

        const overallQuality = airInfoDiv.find('.city-air__chart h4').text().trim();
        const description = airInfoDiv.find('.city-air__txt p:first').text().trim();
        const pm25Value = airInfoDiv.find('.air-charts-iaqi__row:first .air-charts-iaqi__item:nth-child(1) .value').text().trim();
        const pm10Value = airInfoDiv.find('.air-charts-iaqi__row:first .air-charts-iaqi__item:nth-child(2) .value').contents().first().text().trim();
        const o3Value = airInfoDiv.find('.air-charts-iaqi__row:first .air-charts-iaqi__item:nth-child(3) .value').text().trim();
        const coValue = airInfoDiv.find('.air-charts-iaqi__row:last .air-charts-iaqi__item:nth-child(1) .value').text().trim();
        const so2Value = airInfoDiv.find('.air-charts-iaqi__row:last .air-charts-iaqi__item:nth-child(2) .value').text().trim();
        const no2Value = airInfoDiv.find('.air-charts-iaqi__row:last .air-charts-iaqi__item:nth-child(3) .value').text().trim();
        const advice = airInfoDiv.find('.city-air__txt.advise p:last').text().trim();
        
        return {
            "aqivalue": overallQuality,
            "aqides": description,
            "valuepm25": pm25Value,
            "valuepm10": pm10Value,
            "valueo3": o3Value,
            "valueco": coValue,
            "valueso2": so2Value,
            "valueno2": no2Value,
            "aqiadvice": advice
        };
    } catch (error) {
        console.error('获取或解析HTML时出错:', error);
        return null;
    }
}

module.exports = {
    fetchAndExtractaqi
};
