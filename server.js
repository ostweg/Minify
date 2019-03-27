import * as express from "express";
const gm = require('gm').subClass({imageMagick:false});
const app = express();
const isImage = require('is-image');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: __dirname + '/original/',
    filename: function (req,file,cb){
        cb(null, file.originalname);
    }
});
const upload = multer({storage: storage})
app.listen(process.env.PORT || 80, () => {
    console.log("Server listens on port"+80);
});
app.use('/files',express.static(__dirname+'/files'));
app.use('/files',express.static(__dirname+'/original'));
app.get('/', function(req,res){
    res.send("hallo");
});
app.post('/api/file', upload.single(''), function (req,res,next){
    console.log(req.file);
    if(isImage(req.file.filename)){

        gm('original/'+req.file.filename).resize(720,null).write(__dirname+'/files'+'/small_'+req.file.originalname,function (err) {
            if(err) console.log(req.file);
        });
        gm('original/'+req.file.filename).resize(1280,null).write(__dirname+'/files'+'/medium_'+req.file.originalname,function (err) {
            if(err) console.log(req.file);
        });
        gm('original/'+req.file.filename).resize(1920,null).write(__dirname+'/files'+'/big_'+req.file.originalname,function (err) {
            if(err) console.log(req.file);
        });
        res.status(200).send('ok');
    }
    else {
       res.status(500).send('Server error');
       console.log(res.statusCode);
    }
});