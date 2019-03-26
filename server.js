"use strict";
exports.__esModule = true;
var express = require("express");
var gm = require('gm').subClass({ imageMagick: false });
var app = express();
var multer = require('multer');
var storage = multer.diskStorage({
    destination: __dirname,
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
var upload = multer({ storage: storage });
app.listen(process.env.PORT || 80, function () {
    console.log("Server listens on port" + 80);
});
app.use('/files', express.static(__dirname + '/files'));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, OPTIONS, DELETE");
    next();
});
app.get('/', function (req, res) {
    res.send("hallo");
});
app.post('/api/file', upload.single(''), function (req, res, next) {
    gm(req.file.filename).write(__dirname + '/files/' + req.file.originalname, function (err) {
        if (err)
            console.log(req.file);
    });
    gm(req.file.filename).resize(720, null).write(__dirname + '/files' + '/small_' + req.file.originalname, function (err) {
        if (err)
            console.log(req.file);
    });
    gm(req.file.filename).resize(1280, null).write(__dirname + '/files' + '/medium_' + req.file.originalname, function (err) {
        if (err)
            console.log(req.file);
    });
    gm(req.file.filename).resize(1920, null).write(__dirname + '/files' + '/big_' + req.file.originalname, function (err) {
        if (err)
            console.log(req.file);
    });
});
