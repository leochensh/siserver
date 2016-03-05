var express = require('express');
var serveStatic = require('serve-static');

var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

var bodyParser = require('body-parser');

var mongoPool = require("./db");
var logger  = require("./logger");
var dict = require("./dict");

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var acl = require("./access/acl");

var Admin = require("./model/admin");
var Staff = require("./model/staff");

var aclHandler = require("./access/acl");

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
    resave:false,
    saveUninitialized:false,
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
                req.session.userId = null;
                res.status(400);
                errorMsg.code = "error";
                res.send(JSON.stringify(errorMsg));
            }
            else{
                res.status(200);
                successMsg.body = null;
                req.session.userId = msg.name;
                if(msg.orgid){
                    req.session.orgid = msg.orgid;
                }
                req.session.uid = msg._id;
                logger.logger.log("info","admin log in",{name:msg.name});
                res.send(JSON.stringify(successMsg));
            }
        });
    }
    else{
        req.session.userId = null;
        res.status(406);
        errorMsg.code = "wrong";
        res.send(JSON.stringify(errorMsg));
    }

});

app.post("/staff/login",function(req,res){

    var pass = req.body.password;
    var username = req.body.username;
    if(username && pass){
        Staff.login(username,pass,function(err,msg){
            if(msg == "error"){
                req.session.userId = null;
                res.status(400);
                errorMsg.code = "error";
                res.send(JSON.stringify(errorMsg));
            }
            else{
                res.status(200);
                successMsg.body = null;
                req.session.userId = msg.name;
                req.session.orgid = msg.orgid;
                req.session.uid = msg._id;
                logger.logger.log("info","staff log in",{name:msg.name});
                res.send(JSON.stringify(successMsg));
            }
        });
    }
    else{
        req.session.userId = null;
        res.status(406);
        errorMsg.code = "wrong";
        res.send(JSON.stringify(errorMsg));
    }

});



aclHandler.registerWait(function(acl){
    app.get("/testacl",acl.middleware(),function(req,res){
        //console.log(logger);
        logger.logger.log("info","test log",{metax:1});
        res.send("ok");
    });

    app.post("/sadmin/org/create",acl.middleware(1),function(req,res){
        var orgname = req.body.name;

        if(orgname){
            Admin.createOrganization(orgname,function(err,msg){
                if(msg == "duplicate"){
                    res.status(409);
                    errorMsg.code = "duplicate";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","new organization created",{name:msg.name});
                    res.status(200);
                    successMsg.body = null;
                    res.send(JSON.stringify(successMsg));
                }
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.post("/sadmin/org/admin/add",acl.middleware(1),function(req,res){
        var orgid = req.body.orgid;
        var name = req.body.name;
        var pass = req.body.password;

        if(orgid && name && pass){
            Admin.createOrgAdmin(orgid,name,pass,function(err,msg){
                if(msg == "nameduplicate"){
                    res.status(409);
                    errorMsg.code = "name duplicate";
                    res.send(JSON.stringify(errorMsg));
                }
                else if(msg == "orgnotfound"){
                    res.status(404);
                    errorMsg.code = "organization not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","new organization admin created",{name:msg.name});
                    res.status(200);
                    acl.addUserRoles(msg.name, 'admin');
                    successMsg.body = null;
                    res.send(JSON.stringify(successMsg));
                }
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.put("/sadmin/org/admin/resetpass",acl.middleware(1),function(req,res){
        var adminid = req.body.adminid;
        var pass = req.body.password;

        if(adminid && pass){
            Admin.sadminResetAdminPass(adminid,pass,function(err,msg){
                if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "admin not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","superadmin reset admin password",{name:msg.name});
                    res.status(200);
                    successMsg.body = null;
                    res.send(JSON.stringify(successMsg));
                }
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.delete("/sadmin/org/admin/delete",acl.middleware(1),function(req,res){
        var adminid = req.body.adminid;

        if(adminid){
            Admin.sadminDisableAdmin(adminid,function(err,msg){
                if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "admin not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","superadmin disable admin",{name:msg.name});
                    res.status(200);
                    successMsg.body = null;
                    res.send(JSON.stringify(successMsg));
                }
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.put("/admin/pass/change",acl.middleware(),function(req,res){
        var oldpass = req.body.oldpassword;
        var newpass = req.body.newpassword;

        if(oldpass && newpass){
            Admin.changeAdminPass(req.session.userId,oldpass,newpass,function(err,msg){
                if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "admin not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else if(msg == "errorpass"){
                    res.status(403);
                    errorMsg.code = "old password error";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","admin change password",{name:msg.name});
                    res.status(200);
                    successMsg.body = null;
                    res.send(JSON.stringify(successMsg));
                }
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.post("/admin/staff/add",acl.middleware(),function(req,res){

        var name = req.body.name;
        var role = req.body.role;
        var pass = req.body.password;

        if(name && (role == dict.STAFF_EDITOR || role == dict.STAFF_INVESTIGATOR) && pass){
            Admin.addStaff(req.session.orgid,name,role,pass,function(err,msg){
                if(msg == "nameduplicate"){
                    res.status(409);
                    errorMsg.code = "name duplicate";
                    res.send(JSON.stringify(errorMsg));
                }
                else if(msg == "orgnotfound"){
                    res.status(404);
                    errorMsg.code = "organization not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","new staff created",{name:msg.name});
                    res.status(200);
                    acl.addUserRoles(msg.name, role);
                    successMsg.body = null;
                    res.send(JSON.stringify(successMsg));
                }
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.put("/admin/staff/resetpass",acl.middleware(),function(req,res){
        var staffid = req.body.staffid;
        var pass = req.body.password;

        if(staffid && pass){
            Admin.resetStaffPass(req.session.orgid,staffid,pass,function(err,msg){
                if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "staff not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","admin reset staff password",{name:msg.name});
                    res.status(200);
                    successMsg.body = null;
                    res.send(JSON.stringify(successMsg));
                }
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.delete("/admin/staff/delete",acl.middleware(),function(req,res){
        var staffid = req.body.staffid;

        if(staffid){
            Admin.adminDisableStaff(req.session.orgid,staffid,function(err,msg){
                if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "staff not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","admin disable staff",{adminname:req.session.userId,name:msg.name});
                    res.status(200);
                    successMsg.body = null;
                    res.send(JSON.stringify(successMsg));
                }
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.put("/staff/pass/change",acl.middleware(),function(req,res){
        var oldpass = req.body.oldpassword;
        var newpass = req.body.newpassword;

        if(oldpass && newpass){
            Staff.changeStaffPass(req.session.userId,oldpass,newpass,function(err,msg){
                if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "staff not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else if(msg == "errorpass"){
                    res.status(403);
                    errorMsg.code = "old password error";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","staff change password",{name:msg.name});
                    res.status(200);
                    successMsg.body = null;
                    res.send(JSON.stringify(successMsg));
                }
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });
});

var server = app.listen(8080, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port)

});

