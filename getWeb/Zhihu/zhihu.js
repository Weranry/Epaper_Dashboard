var fetch = require('node-fetch');
var cheerio = require('cheerio');

function fetchAndExtractZhihu(callback) {
    var url = 'https://rss.weranry.com/zhihu/daily';
    fetch(url)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('获取RSS数据失败');
            }
            return response.text();
        })
        .then(function(xmlData) {
            var $ = cheerio.load(xmlData, { xmlMode: true });
            var firstItem = $('item').first();
            var title = firstItem.find('title').text();
            var link = firstItem.find('link').text();

            callback(null, {
                "title": title,
                "link": link
            });
        })
        .catch(function(error) {
            console.error('获取或解析HTML时出错:', error);
            callback(error, null);
        });
}

module.exports = {
    fetchAndExtractZhihu: fetchAndExtractZhihu
};

