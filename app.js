var express = require('express');
var serveStatic = require('serve-static');

var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

var bodyParser = require('body-parser');

var mongoPool = require("./db");

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var acl = require("./access/acl");

var Admin = require("./model/admin");

var app = express();

var errorMsg = {
    status:"error",
    //code:"duplicate"
};

var successMsg = {
    status:"ok",
    body:null
};

app.use('/static',serveStatic(__dirname + '/static'));
//app.use(multer({dest:"./static/"}));
app.use(bodyParser.urlencoded({ extended: false }));


app.use(session({
    secret: 'smartinsight',
    store: new MongoStore({
        url: 'mongodb://localhost:27017/smartinsight'
    })
}));
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

app.post("/createsuperadmin",function(req,res){

    var passHash = req.body.password;
    if(passHash){
        Admin.createSuperAdmin(passHash,function(err,msg){
            if(msg == "exist"){
                res.status(409);
                errorMsg.code = "duplicate";
                res.send(JSON.stringify(errorMsg));
            }
            else{
                res.status(200);
                successMsg.body = null;

                res.send(JSON.stringify(successMsg));
            }
        });
    }
    else{
        res.status(406);
        errorMsg.code = "wrong";
        res.send(JSON.stringify(errorMsg));
    }

});

app.post("/admin/login",function(req,res){

    var pass = req.body.password;
    var username = req.body.username;
    console.log(req.session);
    if(username && pass){
        Admin.login(username,pass,function(err,msg){
            if(msg == "error"){
                res.status(400);
                errorMsg.code = "error";
                res.send(JSON.stringify(errorMsg));
            }
            else{
                res.status(200);
                successMsg.body = null;
                console.log(msg.name);
                req.session.userId = msg.name;

                res.send(JSON.stringify(successMsg));
            }
        });
    }
    else{
        res.status(406);
        errorMsg.code = "wrong";
        res.send(JSON.stringify(errorMsg));
    }

});

var server = app.listen(8080, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port)

});

