var qrcode = require('qrcode');

function generateQRCode(text, callback) {
    qrcode.toBuffer(text, { width: 100 }, function(err, buffer) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, buffer);
        }
    });
}

module.exports = {
    generateQRCode: generateQRCode
};

