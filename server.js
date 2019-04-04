"use strict";
exports.__esModule = true;
var express = require("express");
var gm = require('gm').subClass({ imageMagick: false });
var fs = require('fs');
var app = express();
var isImage = require('is-image');
var ffmpeg = require('fluent-ffmpeg');
var mergedvideo = ffmpeg();
var multer = require('multer');
var storage = multer.diskStorage({
    destination: __dirname + '/original/',
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
var storage1 = multer.diskStorage({
    destination: __dirname + '/original/videos/',
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
var storage2 = multer.diskStorage({
    destination: __dirname + '/original/audio/',
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
var videoName = [];
var upload = multer({ storage: storage });
var upload1 = multer({ storage: storage1 });
var upload2 = multer({ storage: storage2 });
app.set('view engine', 'ejs');
app.listen(process.env.PORT || 80, function () {
    console.log("Server listens on port" + 80);
});
app.use('/files', express.static(__dirname + '/files'));
app.use('/files', express.static(__dirname + '/original'));
app.use('/files', express.static(__dirname + '/files/videos'));
app.use('/files', express.static(__dirname + '/original/audio'));
app.get('/video_manager', function (req, res) {
    res.render('video_converter');
});
app.get('/gallery/image', function (req, res) {
    res.render('gallery_image', {
        converted: fs.readdirSync(__dirname + '/files/').filter(function (img) { return img !== '.gitkeep'; }),
        original: fs.readdirSync(__dirname + '/original/')
    });
});
app.get('/play_video', function (req, res) {
    var video2Play = req.query.videoName;
    res.render('custom_video', {
        //video:SearchForVideo(video2Play)
        video: fs.readdirSync(__dirname + '/files/videos/').filter(function (x) { return x == video2Play; })
    });
});
app.get('/audio_manager', function (req, res) {
    res.render('audio_manager');
});
app.get('/audio-player', function (req, res) {
    var audio2Play = req.query.audioName;
    var vtt2Play = req.query.audioName.slice(0, -4) + '.vtt';
    console.log(vtt2Play);
    res.render('audio_player', {
        audio: fs.readdirSync(__dirname + '/original/audio/').filter(function (audio) { return audio == audio2Play; }),
        subtitle: fs.readdirSync(__dirname + '/original/audio/').filter(function (vtt) { return vtt == vtt2Play; })
    });
});
app.post('/api/audio', upload2.array('audio'), function (req, res) {
    var NameOfAudio = req.files[1].filename.slice(0, -4);
    fs.rename('./original/audio/' + req.files[0].filename, './original/audio/' + NameOfAudio + '.vtt', function (err) {
        if (err) {
            console.log(err);
        }
        else {
            res.json({ audio: req.files[1].path, vtt: req.files[0].path });
        }
        ;
    });
});
app.post('/api/videos', upload1.array('videos', 99), function (req, res) {
    var videos = req.files;
    var title = req.body.title;
    var ending = '.mp4';
    for (var i = 0; i < videos.length; i++) {
        videoName.push('./original/videos/' + videos[i].originalname);
    }
    videoName.forEach(function (x) { return mergedvideo.addInput(x); });
    mergedvideo.mergeToFile(__dirname + '/files/videos/' + title + ending)
        .on('error', function (err) {
        console.log('Error', err);
    })
        .on('end', function () {
        console.log("finished");
        res.render('custom_video', {
            video: fs.readdirSync(__dirname + '/files/videos/').filter(function (x) { return x == title + ending; })
        });
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
        data: fs.readdirSync(__dirname + '/files/').filter(function (img) { return img !== '.gitkeep'; }),
        original: fs.readdirSync(__dirname + '/original/')
    });
});
