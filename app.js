var express = require('express');
var serveStatic = require('serve-static');

var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

var bodyParser = require('body-parser');

var mongoPool = require("./db");

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var app = express();

app.use('/static',serveStatic(__dirname + '/static'));
//app.use(multer({dest:"./static/"}));
app.use(bodyParser.urlencoded({ extended: false }));

mongoPool.acquire(function(err, db){
    app.use(session({
        secret: 'smartinsight',
        store: new MongoStore({ db: db })
    }))
});

app.get('/', function (req, res) {
    res.send('Hello World!');
});

var uploadhandle = upload.single("test");
app.post('/upload', function (req, res) {

    uploadhandle(req, res, function (err) {
        if (err) {

            console.log(err);
            res.send("filename error")
        }
        else{
            console.log(req.file.filename)
        }
    });

});

var server = app.listen(8080, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port)

});

