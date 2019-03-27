"use strict";
exports.__esModule = true;
var express = require("express");
var gm = require('gm').subClass({ imageMagick: false });
var app = express();
var multer = require('multer');
var isImage = require('is-image');
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
app.get('/', function (req, res) {
    res.send("hallo");
});
app.post('/api/file', upload.single(''), function (req, res, next) {
    console.log(req.file);
    if (isImage(req.file.filename)) {
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
        res.status(200).send('ok');
    }
    else {
        res.status(500).send('Server error');
        console.log(res.statusCode);
    }
});
