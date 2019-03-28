"use strict";
exports.__esModule = true;
var express = require("express");
var gm = require('gm').subClass({ imageMagick: false });
var fs = require('fs');
var app = express();
var isImage = require('is-image');
var multer = require('multer');
var storage = multer.diskStorage({
    destination: __dirname + '/original/',
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
var upload = multer({ storage: storage });
app.set('view engine', 'ejs');
app.listen(process.env.PORT || 80, function () {
    console.log("Server listens on port" + 80);
});
app.use('/files', express.static(__dirname + '/files'));
app.use('/files', express.static(__dirname + '/original'));
app.get('/gallery/image', function (req, res) {
    res.render('images', {
        converted: fs.readdirSync(__dirname + '/files/'),
        original: fs.readdirSync(__dirname + '/original/')
    });
});
app.post('/api/file', upload.single('file'), function (req, res, next) {
    console.log(req.file);
    if (!fs.existsSync(__dirname + '/files')) {
        fs.mkdirSync(__dirname + '/files');
    }
    if (isImage(req.file.filename)) {
        gm('original/' + req.file.filename).resize(720, null).write(__dirname + '/files' + '/small_' + req.file.originalname, function (err) {
            if (err)
                console.log(err);
        });
        gm('original/' + req.file.filename).resize(1280, null).write(__dirname + '/files' + '/medium_' + req.file.originalname, function (err) {
            if (err)
                console.log(err);
        });
        gm('original/' + req.file.filename).resize(1920, null).write(__dirname + '/files' + '/big_' + req.file.originalname, function (err) {
            if (err)
                console.log(err);
        });
        res.status(200).send('ok');
    }
    else {
        res.status(500).send('Server error');
        console.log(res.statusCode);
    }
});
app.post('/api/files', upload.array('files', 99), function (req, res, next) {
    console.log(req.files);
    var files = req.files;
    for (var i = 0; i < req.files.length; i++) {
        if (isImage(req.files[i].filename)) {
            gm('original/' + files[i].filename).resize(720, null).write(__dirname + '/files' + '/small_' + files[i].originalname, function (err) {
                if (err)
                    console.log(err);
            });
            gm('original/' + files[i].filename).resize(1280, null).write(__dirname + '/files' + '/medium_' + files[i].originalname, function (err) {
                if (err)
                    console.log(err);
            });
            gm('original/' + files[i].filename).resize(1920, null).write(__dirname + '/files' + '/big_' + files[i].originalname, function (err) {
                if (err)
                    console.log(err);
            });
        }
        else {
            res.status(500).send('Server error');
        }
    }
    res.status(200).send('ok');
});
app.get('/*', function (req, res) {
    res.render('index', {
        data: fs.readdirSync(__dirname + '/files/'),
        original: fs.readdirSync(__dirname + '/original/')
    });
});
