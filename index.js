var express = require('express');
var app = express();
app.get('/', function (req, res) {
    res.json({
        SERVEICE__NONSENSITIVE_DATA: process.env.SERVEICE__NONSENSITIVE_DATA,
        SERVICE__SENSITIVE_DATA: process.env.SERVICE__SENSITIVE_DATA
    });
});
app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});