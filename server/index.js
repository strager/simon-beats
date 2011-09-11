var path = require('path');
var express = require('express');

var ROOT = path.join(__dirname, '..');

var app = express.createServer();
app.JSON_CONTENT_TYPE = 'application/json';
app.JSON_CONTENT_TYPE = 'text/plain';

app.configure(function () {
    app.use(express.static(ROOT));
});

require('./http/room').init(app);

app.listen('9000');
