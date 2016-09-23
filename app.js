var express = require('express');
var serveStatic = require('serve-static');
var ObjectID=require('mongodb').ObjectID;
var _ = require("underscore");
var spawn = require('child_process').spawn;
var im = require('imagemagick');
var parse = require('csv-parse');
var fs = require('fs');
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
var XLSX = require('xlsx');
var  path = require('path');
var nodemailer= require('nodemailer');
var avconv = require("avconv");




var mime = require('mime');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, (file.originalname).split('.')[0]+ Date.now() + '.jpg') //Appending .jpg
    }
});

var imageupload = multer({ storage: storage });

var audiovideostorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        var aArray = file.originalname.split('.');
        cb(null, aArray[0]+ Date.now() + '.'+aArray[aArray.length-1]); //Appending .jpg
    }
});

var videoaudioupload = multer({storage:audiovideostorage});

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

app.use('/uploads',serveStatic(__dirname + '/uploads'));
app.use('/public',serveStatic(__dirname + '/public'));
//app.use(multer({dest:"./static/"}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({limit: '4MB'}));


app.use(session({
    secret: 'smartinsight',
    resave:false,
    saveUninitialized:false,
    store: new MongoStore({
        url: 'mongodb://localhost:27017/smartinsight'
    })
}));
app.get('/public/*', function (request, response){
    response.sendFile(path.resolve(__dirname, 'public', 'index.html'))
})
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
                successMsg.body = {
                    role:msg.role,
                    id:msg._id
                };
                req.session.userId = msg.name;
                if(msg.orgid){
                    req.session.orgid = msg.orgid;
                }
                req.session.uid = msg._id;
                req.session.role = msg.role;
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
                successMsg.body = {
                    role:msg.role,
                    id:msg._id
                };
                req.session.userId = msg.name;
                req.session.orgid = msg.orgid;
                req.session.uid = msg._id;
                req.session.role = msg.role;
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

app.get("/logout",function(req,res){

    res.status(200);
    successMsg.body = "success";
    req.session.userId = null;
    req.session.orgid = null;
    req.session.uid = null;
    req.session.role = null;
    res.send(JSON.stringify(successMsg));

});

app.get("/firstpagevisit",function(req,res){
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    Admin.firstPageVisit(ip,function(){
        res.status(200);
        successMsg.body = "ok";
        res.send(JSON.stringify(successMsg));
    })
});

app.get("/getcapcha",function(req,res){
    var cid = null;
    if(req.session.captchaid){
        cid = req.session.captchaid;
    }
    Admin.getCpacha(cid,function(err,newcid,buf){
        req.session.captchaid = newcid;
        res.end(buf);
    })
});

app.post("/checkcapcha",function(req,res){
    var ccode = req.body.capchacode;
    if(ccode && req.session.captchaid){
        Admin.checkCapcha(ccode,req.session.captchaid,function(err,msg){
            if(msg == "notfound"){
                res.status(404);
                errorMsg.code = "not found";
                res.send(JSON.stringify(errorMsg));
            }
            else{
                res.status(200);
                successMsg.body = "success";
                res.send(JSON.stringify(successMsg));
            }
        })
    }
    else{
        res.status(404);
        errorMsg.code = "not found";
        res.send(JSON.stringify(errorMsg));
    }
});

app.get('/downloadapk', function(req, res){
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    Admin.apkDownload(ip,function(err,ver){
        if(ver == "notfound" || !ver.fileurl){
            res.status(404);
            errorMsg.code = "organization not found";
            res.send(JSON.stringify(errorMsg));
        }
        else{
            var file = __dirname +"/uploads/"+ver.fileurl;

            var filename = path.basename(file);
            var mimetype = mime.lookup(file);

            res.setHeader('Content-disposition', 'attachment; filename=' + filename);
            res.setHeader('Content-type', mimetype);

            var filestream = fs.createReadStream(file);
            filestream.pipe(res);
        }

    })


});

aclHandler.registerWait(function(acl){
    app.get("/testacl",acl.middleware(),function(req,res){
        //console.log(logger);
        logger.logger.log("info","test log",{metax:1});
        res.send("ok");
    });

    app.get("/sadmin/edata/flipkart",acl.middleware(1),function(req,res){
        Admin.getFlipkartData(function(err,msg){
            res.status(200);
            successMsg.body = msg;
            res.send(JSON.stringify(successMsg));
        })
    });

    app.get("/sadmin/visit/count",acl.middleware(1),function(req,res){
        Admin.firstPageVisitCount(function(err,count){
            successMsg.body = count;
            res.send(JSON.stringify(successMsg));
        })
    });

    app.get("/sadmin/downloadapk/count",acl.middleware(1),function(req,res){
        Admin.apkDownloadCount(function(err,count){
            successMsg.body = count;
            res.send(JSON.stringify(successMsg));
        })
    });


    app.post("/sadmin/org/create",acl.middleware(1),function(req,res){
        var orgname = req.body.name;

        if(orgname){
            Admin.createOrganization(orgname,function(err,msg,insertedid){
                if(msg == "duplicate"){
                    res.status(409);
                    errorMsg.code = "duplicate";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","new organization created",{name:msg.name});
                    res.status(200);
                    successMsg.body = insertedid;
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

    app.get("/sadmin/org/list",acl.middleware(1),function(req,res){
        Admin.getOrgList(function(err,orgs){
            successMsg.body = orgs;
            res.send(JSON.stringify(successMsg));
        })
    });

    app.post("/sadmin/org/admin/add",acl.middleware(1),function(req,res){
        var orgid = req.body.orgid;
        var name = req.body.name;
        var pass = req.body.password;

        if(orgid && name && pass){
            Admin.createOrgAdmin(orgid,name,pass,"admin",function(err,msg,insertedid){
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
                    successMsg.body = insertedid;
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

    app.get("/sadmin/org/admin/list/:orgid",acl.middleware(1),function(req,res){
        var orgid = req.params.orgid;

        if(orgid && ObjectID.isValid(orgid)){
            Admin.getOrgAdminList(orgid,function(err,msg){
                if(msg == "orgnotfound"){
                    res.status(404);
                    errorMsg.code = "organization not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    //logger.logger.log("info","new organization admin created",{name:msg.name});
                    res.status(200);
                    //acl.addUserRoles(msg.name, 'admin');
                    successMsg.body = msg;
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

        if(adminid && ObjectID.isValid(adminid)){
            Admin.deleteAdmin(adminid,function(err,msg){
                if(msg == "orgnotfound"){
                    res.status(404);
                    errorMsg.code = "admin not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    res.status(200);
                    successMsg.body = "ok";
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

    app.post("/sadmin/personal/add",acl.middleware(1),function(req,res){
        var name = req.body.name;
        var pass = req.body.password;

        if(name && pass){
            var orgname = "__personal"+name;
            if(orgname){
                Admin.createOrganization(orgname,function(err,msg,insertedid){
                    if(msg == "duplicate"){
                        res.status(409);
                        errorMsg.code = "duplicate";
                        res.send(JSON.stringify(errorMsg));
                    }
                    else{
                        logger.logger.log("info","new organization created",{name:msg.name});
                        var orgid = insertedid.toString();
                        Admin.createOrgAdmin(orgid,name,pass,dict.STAFF_PERSONAL,function(err,msg,insertedid){
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
                                acl.addUserRoles(msg.name, dict.STAFF_PERSONAL);
                                successMsg.body = insertedid;
                                res.send(JSON.stringify(successMsg));
                            }
                        })
                    }
                })
            }
            else{
                res.status(406);
                errorMsg.code = "wrong";
                res.send(JSON.stringify(errorMsg));
            }



        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.get("/sadmin/personal/list",acl.middleware(1),function(req,res){
        Admin.getPersonalList(function(err,msg){
            res.status(200);
            successMsg.body = msg;
            res.send(JSON.stringify(successMsg));
        })
    });
    /*add by zzl 2016.8.29*/
    app.get("/sadmin/logs/list",acl.middleware(1),function(req,res){
        Admin.getLogsList(function(err,msg){
            res.status(200);
            successMsg.body = msg;
            res.send(JSON.stringify(successMsg));
        })
    });

    app.delete("/sadmin/logs/delete",acl.middleware(1),function(req,res){
        var logid = req.body.logid;
        console.log(logid);
        if(logid&&ObjectID.isValid(logid)){
            Admin.deletelogList(logid,function(err,msg){
                if(msg == "notfound"){
                    logger.logger.log("info","not found this log!",{
                        logid:req.body.logid
                    });
                    console.log(msg);
                    res.status(404);
                    errorMsg.code = "this log not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","delete successed !",{
                        logid:req.body.logid
                    });
                    console.log(msg);
                    res.status(200);
                    successMsg.body = "ok";
                    res.send(JSON.stringify(successMsg));
                }
            });
        }else{
            logger.logger.log("info","logid wrong!",{
                logid:req.body.logid
            });
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });
    app.get("/admin/staff/list",acl.middleware(2),function(req,res){
        var orgid = req.session.orgid;
        Admin.getOrgStaffList(orgid,function(err,msg){
            res.status(200);
            successMsg.body = msg;
            res.send(JSON.stringify(successMsg));
        })
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
    app.put("/all/resetpass",function(req,res){
        var adminid = req.session.uid;
        var pass = req.body.password;
        if(adminid && pass){
            Admin.sadminResetAdminPass(adminid,pass,function(err,msg){
                if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "the staff not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info"," reset the staff password");
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
    app.get("/all/templatelist",function(req,res){
        Staff.getTemplateList(function(err,templates){
            logger.logger.log("info","get template list",{
                editorid:req.session.uid});
            res.status(200);
            successMsg.body = templates;

            res.send(JSON.stringify(successMsg));
        })
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
    app.get("/sadmin/ad/list",acl.middleware(1),function(req,res){
        Admin.getSadminAdList(function(err,msg){
            res.status(200);
            successMsg.body = msg;
            res.send(JSON.stringify(successMsg));
        })
    });

    app.post("/sadmin/ad/add",acl.middleware(1),function(req,res){
        var title = req.body.title;
        var image = req.body.image;
        var link = req.body.link;
        if(title&&image&&link){
            Admin.addSadminAd(title,image,link,function(err,msg){
                res.status(200);
                successMsg.body = "ok";
                res.send(JSON.stringify(successMsg));
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }

    });

    app.put("/sadmin/ad/edit",acl.middleware(1),function(req,res){
        var adid = req.body.id;
        var title = req.body.title;
        var image = req.body.image;
        var link = req.body.link;
        if(adid&&ObjectID.isValid(adid)&&title&&image&&link){
            Admin.editSadminAd(adid,title,image,link,function(err,msg){
                if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "admin not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    res.status(200);
                    successMsg.body = "ok";
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

    app.delete("/sadmin/ad/delete",acl.middleware(1),function(req,res){
        var adid = req.body.id;

        if(adid&&ObjectID.isValid(adid)){
            Admin.deleteSadminAd(adid,function(err,msg){
                if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "admin not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    res.status(200);
                    successMsg.body = "ok";
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

        if(name && (role == dict.STAFF_EDITOR || role == dict.STAFF_INVESTIGATOR || role == dict.STAFF_ORG) && pass){
            Admin.addStaff(req.session.orgid,name,role,pass,function(err,msg,insertid){
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
                    successMsg.body = insertid;
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

    app.post("/editor/survey/create",acl.middleware(2),function(req,res){
        var name = req.body.name;
        var type = req.body.type;

        if(name && (type == dict.TYPE_SURVEY || type == dict.TYPE_TEMPLATE)){
            Staff.createSurvey(req.session.orgid,req.session.uid,name,type,function(err,sur){
                logger.logger.log("info","staff create survey",{
                    id:sur,
                    editorid:req.session.uid});
                res.status(200);
                successMsg.body = sur;
                console.log(JSON.stringify(successMsg));
                res.send(JSON.stringify(successMsg));
            });
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.put("/editor/survey/edit",acl.middleware(2),function(req,res){
        var name = req.body.name;
        var surveyid = req.body.id;
        var metainfo = req.body.metainfo;

        if(name && ObjectID.isValid(surveyid)){
            Staff.editSurvey(name,surveyid,metainfo,function(err,msg){
                if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "survey not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","staff edit survey name",{
                        id:surveyid,
                        editorid:req.session.uid});
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

    app.post("/editor/survey/question/add",acl.middleware(2),function(req,res){
        var surveydata = req.body;
        if(checkSurveyData(surveydata)){
            Staff.createQuestion(req.session.orgid,surveydata,function(err,msg){
                if(msg == "forbidden"){
                    res.status(403);
                    errorMsg.code = "can not operate";
                    res.send(JSON.stringify(errorMsg));
                }
                else if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "survey not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","staff create question",{
                        id:msg,
                        editorid:req.session.uid});
                    res.status(200);
                    successMsg.body = msg;
                    console.log(JSON.stringify(successMsg));
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

    app.put("/editor/survey/question/edit",acl.middleware(2),function(req,res){
        var surveydata = req.body;
        console.log(JSON.stringify(surveydata));
        if(checkSurveyData(surveydata) && ObjectID.isValid(surveydata.questionid)){
            Staff.editQuestion(req.session.orgid,surveydata,function(err,msg){
                if(msg == "forbidden"){
                    res.status(403);
                    errorMsg.code = "can not operate";
                    res.send(JSON.stringify(errorMsg));
                }
                else if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "survey not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","staff edit question",{
                        id:surveydata.questionid,
                        editorid:req.session.uid});
                    res.status(200);
                    successMsg.body = null;
                    console.log(JSON.stringify(successMsg));
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


    app.get("/editor/survey/list",acl.middleware(2),function(req,res){
        var editorid = req.session.uid;

            Staff.getEditorSurveyList(editorid,function(err,ss){
                if(!ss){
                    ss = [];
                }
                logger.logger.log("info","editor get survey list",{
                    editorid:req.session.uid});
                res.status(200);
                successMsg.body = ss;

                res.send(JSON.stringify(successMsg));
            });


    });

    app.get("/sadmin/survey/list",acl.middleware(1),function(req,res){

            Staff.getSAdminSurveyList(function(err,ss){

                logger.logger.log("info","admin get survey list",{
                    editorid:req.session.uid});
                res.status(200);
                successMsg.body = ss;

                res.send(JSON.stringify(successMsg));
            });



    });


    app.post("/sadmin/survey/totemplate",acl.middleware(1),function(req,res){

        var surveyid = req.body.surveyid;
        var templatename = req.body.templatename;

        if(surveyid && ObjectID.isValid(surveyid) && templatename){
            Staff.generateTemplatefromSurvey(surveyid,templatename,function(err,msg){

                logger.logger.log("info","admin generate template",{
                    editorid:req.session.uid});

                if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "survey not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    res.status(200);
                    successMsg.body = msg;

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

    app.post("/admin/survey/fromtemplate",acl.middleware(2),function(req,res){

        var surveyid = req.body.surveyid;
        var surveyname = req.body.surveyname;

        if(surveyid && ObjectID.isValid(surveyid) && surveyname){

            Staff.createSurvey(req.session.orgid,req.session.uid,surveyname,dict.TYPE_SURVEY,function(err,sur){
                logger.logger.log("info","staff create survey",{
                    id:sur,
                    editorid:req.session.uid});



                Staff.cloneQuestionListFromTemplate(sur,surveyid,function(err,msg){
                    if(msg == "notfound"){
                        res.status(404);
                        errorMsg.code = "survey not found";
                        res.send(JSON.stringify(errorMsg));
                    }
                    else{
                        res.status(200);
                        successMsg.body = sur;

                        res.send(JSON.stringify(successMsg));
                    }
                })

            });
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }


    });

    app.get("/admin/survey/list",acl.middleware(2),function(req,res){
        var orgid = req.session.orgid;

            Staff.getAdminSurveyList(orgid,function(err,ss){
                if(!ss){
                    ss = [];
                }
                logger.logger.log("info","admin get survey list",{
                    editorid:req.session.uid});
                res.status(200);
                successMsg.body = ss;

                res.send(JSON.stringify(successMsg));
            });




    });

    app.delete("/editor/survey/question/delete",acl.middleware(2),function(req,res){
        var qid = req.body.questionid;

        if(qid){
            Staff.deleteQuestion(req.session.orgid,qid,function(err,msg){
                if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "survey not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","staff delete question",{
                        id:qid,
                        editorid:req.session.uid});
                    res.status(200);
                    successMsg.body = msg;

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

    app.put("/editor/survey/question/sequencechange",acl.middleware(2),function(req,res){
        var surveyid = req.body.surveyid;
        var questionid = req.body.questionid;
        var direction = req.body.direction;

        if(surveyid && questionid && direction){
            Staff.changeQuestionSequence(surveyid,questionid,direction,function(err,msg){
                if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "survey not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","staff change question sequence",{
                        id:surveyid,
                        questionid:questionid});
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

    app.put("/editor/survey/rfp",acl.middleware(2),function(req,res){
        var surveyid = req.body.surveyid;
        console.log("haha")
        if(surveyid){
            Staff.proposeSurvey(req.session.orgid,surveyid,function(err,msg){
                if(msg == "forbidden"){
                    res.status(403);
                    errorMsg.code = "can not operate";
                    res.send(JSON.stringify(errorMsg));
                }
                else if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "survey not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","staff propose survey for audit",{
                        id:surveyid,
                        editorid:req.session.uid});
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

    app.delete("/editor/survey/delete",acl.middleware(2),function(req,res){
        var surveyid = req.body.surveyid;
        if(surveyid && ObjectID.isValid(surveyid)){
            Staff.deleteSurvey(surveyid,function(err,msg){
                if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "survey not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","staff propose survey delete",{
                        id:surveyid,
                        editorid:req.session.uid});
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

    app.get("/editor/survey/detail/:surveyid",acl.middleware(2),function(req,res){
        var surveyid = req.params.surveyid;
        if(surveyid && ObjectID.isValid(surveyid)){
            Staff.getSurveyFullDetail(surveyid,function(err,msg){
                if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "survey not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","staff get survey detail",{
                        id:req.session.uid,
                        surveyid:surveyid
                    });
                    res.status(200);
                    successMsg.body = msg;

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

    app.put("/admin/survey/audit",acl.middleware(2),function(req,res){
        var surveyid = req.body.surveyid;
        var status = req.body.status;
        if(surveyid && ObjectID.isValid(surveyid) && status &&
            (status == dict.SURVEYSTATUS_DISABLE || status == dict.SURVEYSTATUS_EDIT ||
            status == dict.SURVEYSTATUS_NORMAL || status == dict.SURVEYSTATUS_REJECT)){
            Admin.auditSurvey(req.session.orgid,surveyid,status,function(err,msg){
                if(msg == "forbidden"){
                    res.status(403);
                    errorMsg.code = "can not operate";
                    res.send(JSON.stringify(errorMsg));
                }
                else if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "survey not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","admin audit survey",{
                        id:surveyid,
                        adminid:req.session.uid,
                        status:status});
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

    app.put("/admin/survey/assign",acl.middleware(2),function(req,res){
        var surveyid = req.body.surveyid;
        var staffid = req.body.staffid;
        if(surveyid && staffid &&
            ObjectID.isValid(surveyid) && ObjectID.isValid(staffid)){
            Admin.assignSurvey(req.session.orgid,surveyid,staffid,function(err,msg){
                if(msg == "forbidden"){
                    res.status(403);
                    errorMsg.code = "can not operate";
                    res.send(JSON.stringify(errorMsg));
                }
                else if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "survey not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","admin assign survey",{
                        surveyid:surveyid,
                        adminid:req.session.uid,
                        staffid:staffid});
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

    app.post("/admin/survey/publishtoown",acl.middleware(2),function(req,res){
        var surveyid = req.body.surveyid;
        var ownid = req.session.uid;
        var role = req.session.role;
        //var orgid = req.session.orgid;

        if(surveyid && ObjectID.isValid(surveyid) && ObjectID.isValid(ownid)){
            Admin.publishSurveyToOwn(surveyid,ownid,role,function(err,msg){
                if(msg == "forbidden"){
                    res.status(403);
                    errorMsg.code = "forbidden";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
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

    app.put("/admin/survey/withdraw",acl.middleware(2),function(req,res){
        var surveyid = req.body.surveyid;
        var ownid = req.session.uid;
        var role = req.session.role;
        //var orgid = req.session.orgid;

        if(surveyid && ObjectID.isValid(surveyid) && ObjectID.isValid(ownid)){
            Admin.withdrawPublishSurvey(surveyid,ownid,role,function(err,msg){
                if(msg == "forbidden"){
                    res.status(403);
                    errorMsg.code = "forbidden";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
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

    app.get("/admin/temporychangesurvey",function(req,res){  //临时接口，用于将已发布问卷转为publishtoall
        Admin.temproryChangeSurvey(function(err,msg){
            res.status(200);
            successMsg.body = null;
            res.send(JSON.stringify(successMsg));
        })
    });



    app.put("/sadmin/survey/audit",acl.middleware(1),function(req,res){
        var surveyid = req.body.surveyid;
        if(surveyid && ObjectID.isValid(surveyid)){
            Admin.sadminAuditSurvey(surveyid,function(err,msg){
                if(msg == "forbidden"){
                    res.status(403);
                    errorMsg.code = "forbidden";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
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

    function flipkartModelSpider(callback){
        var py = spawn("scrapy",["crawl","modelspider"],{
            cwd:path.resolve("./scrapy/flipkart")
        });

        py.stdout.on('data', function(data) {
            console.log("stdout:"+data);
        });

        py.stderr.on('data', function(data) {
            console.log("stderr:"+data);
        });

        py.on("close",function(code){
            console.log("close:"+code);
            console.log("+++++++++++++++++++++++++++++++++++++++++++++++++")
            if(callback){
                callback();
            }

        })
    }

    function flipkartModelDetailSpider(callback){
        var py = spawn("scrapy",["crawl","modeldetailspider"],{
            cwd:path.resolve("./scrapy/flipkart/flipkart")
        });

        py.stdout.on('data', function(data) {
            console.log("stdout:"+data);
        });

        py.stderr.on('data', function(data) {
            console.log("stderr:"+data);
        });

        py.on("close",function(code){
            console.log("close:"+code)
            if(callback){
                callback();
            }
        })
    }

    function amazonInModelSpider(callback){
        var py = spawn("scrapy",["crawl","ainmodelspider"],{
            cwd:path.resolve("./scrapy/flipkart")
        });

        py.stdout.on('data', function(data) {
            console.log("stdout:"+data);
        });

        py.stderr.on('data', function(data) {
            console.log("stderr:"+data);
        });

        py.on("close",function(code){
            console.log("close:"+code);
            console.log("+++++++++++++++++++++++++++++++++++++++++++++++++")
            if(callback){
                callback();
            }

        })
    }

    function amazonInModelDetailSpider(callback){
        var py = spawn("scrapy",["crawl","ainmodeldetailspider"],{
            cwd:path.resolve("./scrapy/flipkart/flipkart")
        });

        py.stdout.on('data', function(data) {
            console.log("stdout:"+data);
        });

        py.stderr.on('data', function(data) {
            console.log("stderr:"+data);
        });

        py.on("close",function(code){
            console.log("close:"+code)
            if(callback){
                callback();
            }
        })
    }

    app.post("/sadmin/createspider",acl.middleware(1),function(req,res){
        var spidername = req.body.spidername;
        if(spidername){
            Admin.createSpider(spidername,function(err,msg){
                if(msg == "BUSY"){
                    res.status(409);
                    errorMsg.code = "busy";
                    res.send(JSON.stringify(errorMsg));
                }
                else{

                    if(spidername == "flipkart"){
                        flipkartModelSpider(function(){
                            flipkartModelDetailSpider(
                                function(){
                                    Admin.stopSpider(function(err,res){
                                        console.log("spider done");
                                    })
                                }
                            );
                        });
                    }
                    else if(spidername == "amazonindia"){
                        amazonInModelSpider(function(){
                            amazonInModelDetailSpider(function () {
                                Admin.stopSpider(function(err,res){
                                    console.log("spider done");
                                })
                            })
                        })
                    }



                    res.status(200);
                    successMsg.body = msg;
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

    app.delete("/sadmin/deletespider",acl.middleware(1),function(req,res){
        var sid = req.body.spiderid;
        if(sid && ObjectID.isValid(sid)){
            Admin.deleteSpider(sid,function(err,msg){
                res.status(200);
                successMsg.body = "ok";
                res.send(JSON.stringify(successMsg));
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }

    });

    app.get("/sadmin/spiderlist/:spidername",acl.middleware(1),function(req,res){
        var sname = req.params.spidername;
        if(sname){
            Admin.getSpiderList(sname,function(err,msg){
                res.status(200);
                successMsg.body = msg;
                res.send(JSON.stringify(successMsg));
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.get("/sadmin/activeid/:spidername",function(req,res){
        var sname = req.params.spidername;
        Admin.getSpiderActiveId(sname,function(err,msg){
            res.status(200);
            res.send(msg);
        })
    });

    // app.delete("/sadmin/delete",acl.middleware(1),function(req,res){
    //     var sid = req.body.spiderid;
    //     if(sid && ObjectID.isValid(sid)){
    //         Admin.deleteSpider(sid,function(err,msg){
    //             res.status(200);
    //             successMsg.body = "ok";
    //             res.send(JSON.stringify(successMsg));
    //         })
    //     }
    //     else{
    //         res.status(406);
    //         errorMsg.code = "wrong";
    //         res.send(JSON.stringify(errorMsg));
    //     }
    // });

    var exportDomainList = {
        "flipkart":[
            "title","brand","color","keyfeature","price","simtype","pcamera","scamera",
            "screen","Resolution","RAM","ROM","os","osversionnum","osversionname","battery",
            "rating","avgrate","reviewNum"
        ],
        "amazonindia":[
            "title","brand","color","specialfeature","price","Camera",
            "RAM","os","battery",
            "avgrate","reviewNum"
        ]
    };

    app.post("/sadmin/exportspider",acl.middleware(1),function(req,res){
        var sid = req.body.spiderid;
        var sname = req.body.spidername;
        if(sid && ObjectID.isValid(sid) && sname && (sname == "flipkart" || sname == "amazonindia")){

            Admin.getSpiderDetailData(sid,function(err,models){
                var data = [];
                data.push(exportDomainList[sname]);
                for(var mindex in models){
                    var pitem = [];
                    for (var tagindex in exportDomainList[sname]){
                        if (models[mindex][exportDomainList[sname][tagindex]]){
                            pitem.push(models[mindex][exportDomainList[sname][tagindex]]);
                        }
                        else{
                            pitem.push("");
                        }
                    }
                    data.push(pitem);
                }
                var name = sname+ new Date().toISOString() + ".xlsx";
                var ws_name = "SheetJS";

                function Workbook() {
                    if(!(this instanceof Workbook)) return new Workbook();
                    this.SheetNames = [];
                    this.Sheets = {};
                }

                var wb = new Workbook(), ws = sheet_from_array_of_arrays(data);

                /* add worksheet to workbook */
                wb.SheetNames.push(ws_name);
                wb.Sheets[ws_name] = ws;

                /* write file */
                XLSX.writeFile(wb, 'uploads/'+name);
                successMsg.body = name;

                res.send(JSON.stringify(successMsg));
            })


        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.get("/sadmin/spiderstatistics/brand/top10modelnum/:spiderid",acl.middleware(1),function(req,res){
        var sid = req.params.spiderid;
        if(sid && ObjectID.isValid(sid)){

            Admin.getTop10modelnumForBrand(sid,function(err,result){

                res.status(200);
                successMsg.body = result;
                res.send(JSON.stringify(successMsg));
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.get("/sadmin/spiderstatistics/brand/top10reviewnum/:spiderid",acl.middleware(1),function(req,res){
        var sid = req.params.spiderid;
        if(sid && ObjectID.isValid(sid)){

            Admin.getTop10reviewnumForBrand(sid,function(err,result){

                res.status(200);
                successMsg.body = result;
                res.send(JSON.stringify(successMsg));
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.get("/sadmin/spiderstatistics/brand/top10salesamount/:spiderid",acl.middleware(1),function(req,res){
        var sid = req.params.spiderid;
        if(sid && ObjectID.isValid(sid)){

            Admin.getTop10salesamountForBrand(sid,function(err,result){

                res.status(200);
                successMsg.body = result;
                res.send(JSON.stringify(successMsg));
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.get("/sadmin/spiderstatistics/brand/top10avgprice/:spiderid",acl.middleware(1),function(req,res){
        var sid = req.params.spiderid;
        if(sid && ObjectID.isValid(sid)){

            Admin.getTop10avgpriceForBrand(sid,function(err,result){

                res.status(200);
                successMsg.body = result;
                res.send(JSON.stringify(successMsg));
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.get("/sadmin/spiderstatistics/model/top10reviewnum/:spiderid",acl.middleware(1),function(req,res){
        var sid = req.params.spiderid;
        if(sid && ObjectID.isValid(sid)){

            Admin.getTop10reviewnumForModel(sid,function(err,result){

                res.status(200);
                successMsg.body = result;
                res.send(JSON.stringify(successMsg));
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.get("/sadmin/spiderstatistics/model/top10salesamount/:spiderid",acl.middleware(1),function(req,res){
        var sid = req.params.spiderid;
        if(sid && ObjectID.isValid(sid)){

            Admin.getTop10salesamountForModel(sid,function(err,result){

                res.status(200);
                successMsg.body = result;
                res.send(JSON.stringify(successMsg));
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.get("/sadmin/spiderstatistics/model/top10price/:spiderid",acl.middleware(1),function(req,res){
        var sid = req.params.spiderid;
        if(sid && ObjectID.isValid(sid)){

            Admin.getTop10priceForModel(sid,function(err,result){

                res.status(200);
                successMsg.body = result;
                res.send(JSON.stringify(successMsg));
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.get("/sadmin/spiderstatistics/model/pricerangebynum/:spiderid",acl.middleware(1),function(req,res){
        var sid = req.params.spiderid;
        if(sid && ObjectID.isValid(sid)){

            Admin.getpricerangebynumForModel(sid,function(err,result){

                res.status(200);
                successMsg.body = result;
                res.send(JSON.stringify(successMsg));
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.get("/sadmin/spiderstatistics/model/pricerangebyreviewnum/:spiderid",acl.middleware(1),function(req,res){
        var sid = req.params.spiderid;
        if(sid && ObjectID.isValid(sid)){

            Admin.getpricerangebyreviewnumForModel(sid,function(err,result){

                res.status(200);
                successMsg.body = result;
                res.send(JSON.stringify(successMsg));
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.get("/sadmin/spiderstatistics/model/pricerangebysalesamount/:spiderid",acl.middleware(1),function(req,res){
        var sid = req.params.spiderid;
        if(sid && ObjectID.isValid(sid)){

            Admin.getpricerangebysalesamountForModel(sid,function(err,result){

                res.status(200);
                successMsg.body = result;
                res.send(JSON.stringify(successMsg));
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.get("/sadmin/spiderstatistics/model/colormodelnum/:spiderid",acl.middleware(1),function(req,res){
        var sid = req.params.spiderid;
        if(sid && ObjectID.isValid(sid)){

            Admin.getcolorbymodelnumForModel(sid,function(err,result){

                res.status(200);
                successMsg.body = result;
                res.send(JSON.stringify(successMsg));
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.get("/sadmin/spiderstatistics/model/colorreviewnum/:spiderid",acl.middleware(1),function(req,res){
        var sid = req.params.spiderid;
        if(sid && ObjectID.isValid(sid)){

            Admin.getcolorbyreviewnumForModel(sid,function(err,result){

                res.status(200);
                successMsg.body = result;
                res.send(JSON.stringify(successMsg));
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.get("/sadmin/spiderstatistics/model/coloravgprice/:spiderid",acl.middleware(1),function(req,res){
        var sid = req.params.spiderid;
        if(sid && ObjectID.isValid(sid)){

            Admin.getcolorbyavgpriceForModel(sid,function(err,result){

                res.status(200);
                successMsg.body = result;
                res.send(JSON.stringify(successMsg));
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.get("/sadmin/spiderstatistics/model/batterymodelnum/:spiderid",acl.middleware(1),function(req,res){
        var sid = req.params.spiderid;
        if(sid && ObjectID.isValid(sid)){

            Admin.getbatterybymodelnumForModel(sid,function(err,result){

                res.status(200);
                successMsg.body = result;
                res.send(JSON.stringify(successMsg));
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.get("/sadmin/spiderstatistics/model/batteryreviewnum/:spiderid",acl.middleware(1),function(req,res){
        var sid = req.params.spiderid;
        if(sid && ObjectID.isValid(sid)){

            Admin.getbatterybyreviewnumForModel(sid,function(err,result){

                res.status(200);
                successMsg.body = result;
                res.send(JSON.stringify(successMsg));
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.get("/sadmin/spiderstatistics/model/batteryaverageprice/:spiderid",acl.middleware(1),function(req,res){
        var sid = req.params.spiderid;
        if(sid && ObjectID.isValid(sid)){

            Admin.getbatterybyavgpriceForModel(sid,function(err,result){

                res.status(200);
                successMsg.body = result;
                res.send(JSON.stringify(successMsg));
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.post("/admin/survey/publishtoall",acl.middleware(2),function(req,res){
        var surveyid = req.body.surveyid;
        var ownid = req.session.uid;
        var role = req.session.role;

        if(surveyid && ObjectID.isValid(surveyid) && ObjectID.isValid(ownid)){
            Admin.publishSurveyToAll(surveyid,ownid,role,function(err,msg){
                if(msg == "forbidden"){
                    res.status(403);
                    errorMsg.code = "forbidden";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
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


        //var orgid = req.session.orgid;
        //var broadCastToStaffs = function(orgid,surveyid,staffs){
        //    var slist = [];
        //    for(var i in staffs){
        //        if(!(staffs[i].disable)){
        //            slist.push(staffs[i]._id);
        //        }
        //    }
        //
        //    Admin.publishSurvey(orgid,surveyid,slist,function(err,msg){
        //        if(msg == "forbidden"){
        //            res.status(403);
        //            errorMsg.code = "can not operate";
        //            res.send(JSON.stringify(errorMsg));
        //        }
        //        else{
        //            res.status(200);
        //            successMsg.body = null;
        //            res.send(JSON.stringify(successMsg));
        //        }
        //
        //    })
        //}
        //if(surveyid && ObjectID.isValid(surveyid)){
        //    if(req.session.role == dict.STAFF_PERSONAL){
        //        Admin.getPersonalList(function(err,staffs){
        //            broadCastToStaffs(orgid,surveyid,staffs);
        //        })
        //    }
        //    else{
        //        Admin.getOrgAllUserList(orgid,function(err,staffs){
        //            broadCastToStaffs(orgid,surveyid,staffs);
        //        })
        //    }
        //
        //}
        //else{
        //    res.status(406);
        //    errorMsg.code = "wrong";
        //    res.send(JSON.stringify(errorMsg));
        //}
    });

    app.get("/admin/survey/answer/list/:surveyid",function(req,res){
        var surveyid = req.params.surveyid;
        if(surveyid && ObjectID.isValid(surveyid)){
            Admin.getSurveyAnswerList(surveyid,function(err,answers){
                successMsg.body = answers;
                res.send(JSON.stringify(successMsg));
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }


    });
    //app.get("/removerepeatassign",function(req,res){ //临时接口，用于去除问卷分配的重复
    //    Admin.removeAssginRepeat(function(err,msg){
    //        successMsg.body = null;
    //        res.send(JSON.stringify(successMsg));
    //    })
    //});

    app.get('/investigator/survey/list',acl.middleware(2),function(req,res){
        Staff.getStaffSurveyList(req.session.uid,req.session.orgid,req.session.role,function(err,msg){
            if(msg == "notfound"){
                res.status(404);
                errorMsg.code = "survey not found";
                res.send(JSON.stringify(errorMsg));
            }
            else{
                logger.logger.log("info","staff get surveylist",{
                    id:req.session.uid
                });
                res.status(200);
                successMsg.body = msg;

                res.send(JSON.stringify(successMsg));
            }
        })
    });

    app.get("/investigator/survey/detail/:surveyid",acl.middleware(2),function(req,res){
        var surveyid = req.params.surveyid;
        if(surveyid && ObjectID.isValid(surveyid)){
            Staff.getSurveyDetail(surveyid,function(err,msg){
                if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "survey not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","staff get survey detail",{
                        id:req.session.uid,
                        surveyid:surveyid
                    });
                    res.status(200);
                    successMsg.body = msg;

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

    app.get("/anonymous/survey/detail/:surveyid",function(req,res){
        var surveyid = req.params.surveyid;
        if(surveyid && ObjectID.isValid(surveyid)){
            Staff.getSurveyDetail(surveyid,function(err,msg){
                if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "survey not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","anonymous get survey detail",{
                        surveyid:surveyid
                    });
                    res.status(200);
                    successMsg.body = msg;

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

    app.delete("/admin/survey/answer/delete",acl.middleware(2),function(req,res){
        var answerid = req.body.answerid;
        if(answerid && ObjectID.isValid(answerid)){
            Admin.deleteAnswer(answerid,function(err,msg){
                if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "survey not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    res.status(200);
                    successMsg.body = "ok";
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

    app.post("/investigator/survey/answer/add",acl.middleware(2),function(req,res){
        var surveyid = req.body.surveyid;
        var investigatorid = req.session.uid;
        if(surveyid && ObjectID.isValid(surveyid) && investigatorid &&
            ObjectID.isValid(investigatorid) && req.body.answerlist){
            Staff.saveAnswers(req.body,investigatorid,function(err,msg){
                if(msg=="duplicate"){
                    res.status(409);
                    errorMsg.code = "duplicate";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","staff send survey answer",{
                        staffid:req.session.uid,
                        surveyid:surveyid,
                        answerid:msg
                    });
                    res.status(200);
                    successMsg.body = msg;
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

    app.post("/anonymous/survey/answer/add",function(req,res){
        var surveyid = req.body.surveyid;
        if(surveyid && ObjectID.isValid(surveyid) && req.body.answerlist){
            Staff.saveAnswers(req.body,null,function(err,msg){
                logger.logger.log("info","anonymous send survey answer",{
                    surveyid:surveyid,
                    answerid:msg
                });
                res.status(200);
                successMsg.body = msg;

                res.send(JSON.stringify(successMsg));
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.get("/investigator/survey/answer/list/:pagesize/:pagenum",acl.middleware(2),function(req,res){
        var pagesize = req.params.pagesize;
        var pagenum = req.params.pagenum;
        if(pagesize && pagenum){
            var intPagesize = parseInt(pagesize);
            var intPagenum = parseInt(pagenum);
            if(!isNaN(intPagesize) && intPagesize>=0 && !isNaN(intPagenum) && intPagenum>=0){
                Staff.getAnswerList(intPagesize,intPagenum,req.session.uid,function(err,msg){
                    logger.logger.log("info","staff get survey answer list",{
                        staffid:req.session.uid

                    });
                    res.status(200);
                    successMsg.body = msg;

                    res.send(JSON.stringify(successMsg));
                });
            }
            else{
                res.status(406);
                errorMsg.code = "wrong";
                res.send(JSON.stringify(errorMsg));
            }
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.get("/investigator/survey/answer/detail/:answerid",acl.middleware(2),function(req,res){
        var answerid = req.params.answerid;

        if(answerid && ObjectID.isValid(answerid)){
            Staff.getAnswerDetail(answerid,function(err,msg){
                if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "answer not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","staff get answer detail",{
                        id:req.session.uid,
                        answerid:answerid
                    });
                    res.status(200);
                    successMsg.body = msg;

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

    var staffImageUploadHandle = imageupload.single("file");
    app.post('/staff/upload/image',acl.middleware(2),function (req, res) {

        staffImageUploadHandle(req, res, function (err) {
            if (err) {
                res.status(406);
                console.log(err);
                res.send("filename error")
            }
            else{

                var newFname = req.file.path.split(".")[0]+"_small.jpg";


                im.convert([req.file.path,"-quality","30",req.file.path],function(err,fout){

                    successMsg.body = req.file.filename;

                    res.send(JSON.stringify(successMsg));
                })


            }
        });

    });

    var avuploadHandler = videoaudioupload.single("file");
    app.post('/staff/upload/audio',acl.middleware(2),function (req, res) {

        avuploadHandler(req, res, function (err) {
            if (err) {
                res.status(406);
                console.log(err);
                res.send("filename error")
            }
            else{
                var dfilename = req.file.filename;
                var farray = dfilename.split(".");
                var ext = farray[farray.length-1];
                if(ext == "amr"){
                    if(isFileExist("uploads/"+dfilename)){
                        var fmp3 = "uploads/"+farray[0]+".mp3";
                        if(isFileExist(fmp3)){

                        }
                        else{
                            var parameters = ["-i","uploads/"+dfilename,fmp3];
                            var stream = avconv(parameters);
                        }
                    }
                }
                successMsg.body = req.file.filename;
                res.send(JSON.stringify(successMsg));
            }
        });

    });

    app.post('/staff/upload/video',acl.middleware(2),function (req, res) {

        avuploadHandler(req, res, function (err) {
            if (err) {
                res.status(406);
                console.log(err);
                res.send("filename error")
            }
            else{
                successMsg.body = req.file.filename;
                res.send(JSON.stringify(successMsg));
            }
        });

    });

    app.post('/parsexlsx',function(req,res){
        var file = req.body.file;

        var letterMap = ["A","B","C","D","E",
            "F","G","H","I","J",
            "K","L","M","N","O",
            "P","Q","R","S","T",
            "U","V","W","X","Y","Z",
            "AA","AB","AC","AD","AE",
            "AF","AG","AH","AI","AJ",
            "AK","AL","AM","AN","AO",
            "AP","AQ","AR","AS","AT",
            "AU","AV","AW","AX","AY","AZ",
            "BA","BB","BC","BD","BE",
            "BF","BG","BH","BI","BJ",
            "BK","BL","BM","BN","BO",
            "BP","BQ","BR","BS"
        ];

        if(file){
            var fextenstionarray = file.split(".");
            var fextenstion = fextenstionarray[fextenstionarray.length-1];
            if(fextenstion == "csv"){

                fs.readFile("./uploads/"+file,function(err,data){

                    parse(data,function(err,output){
                        //output = output[0]
                        if(output[0][0] == "2"){
                            var qlist = parseV2List(output);
                            successMsg.body = qlist;
                            res.send(JSON.stringify(successMsg));
                        }
                        else if(output[0][0] == "3"){
                            var qlist = parseV3List(output);
                            successMsg.body = qlist;
                            res.send(JSON.stringify(successMsg));
                        }
                        else if(output[0][0] == "4"){
                            var qlist = parseV4List(output);
                            successMsg.body = qlist;
                            res.send(JSON.stringify(successMsg));
                        }
                        else{
                            var qlist = parseV1List(output);
                            successMsg.body = qlist;
                            res.send(JSON.stringify(successMsg));
                        }

                    })


                })
            }
            else if(fextenstion == "xlsx"){
                var workbook = XLSX.readFile("./uploads/"+file);
                var sheet_name_list = workbook.SheetNames;
                console.log(sheet_name_list)
                var result = ""


                var firstSheet = workbook.Sheets[sheet_name_list[0]];
                var resultList = [];
                var currentRow = 1;


                while(firstSheet["A"+currentRow]){
                    var row = []
                    var start = 0;
                    while(firstSheet[letterMap[start]+currentRow]){
                        var v = firstSheet[letterMap[start]+currentRow].v;
                        var vt = JSON.stringify(v).trim();
                        if(vt[0] && vt[0] == "\""){
                            var vlength = vt.length;
                            vt = vt.substring(1,vlength-1).trim();
                        }
                        vt = vt.replace("\\r\\n","\r\n");
                        row.push(vt);
                        start+=1;
                    }
                    resultList.push(row);
                    currentRow+=1;
                }

                console.log(resultList);
                if(resultList[0][0] == "2"){
                    var qlist = parseV2List(resultList);
                }
                else if(resultList[0][0] == 3){
                    var qlist = parseV3List(resultList);
                }
                else if(resultList[0][0] == "4"){
                    var qlist = parseV4List(resultList);

                }
                else{
                    var qlist = parseV1List(resultList);
                }

                successMsg.body = qlist;
                res.send(JSON.stringify(successMsg));
            }

        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.post("/investigator/feedback",acl.middleware(2),function(req,res){
        var staffid = req.session.uid;
        var platform = req.body.platform;
        var osversion = req.body.osversion;
        var versionnum = req.body.versionnum;
        var content = req.body.content;
        var image = req.body.image;
        var fdata = {
            staffid:staffid,
            platform:platform,
            osversion:osversion,
            versionnum:versionnum,
            content:content,
            image:image
        };
        Staff.addFeedback(fdata,function(err,msg){
            logger.logger.log("info","staff add feedback",{
                staffid:req.session.uid,
                feedbackid:msg
            });
            res.status(200);
            successMsg.body = msg;

            res.send(JSON.stringify(successMsg));
        })
    });
    /* add by zhangzhiliang 2016.9.9  start*/
    app.get("/sadmin/feedback/list",acl.middleware(1),function(req,res){
        Admin.getFeedbackList(function(err,msg){
            res.status(200);
            successMsg.body = msg;
            res.send(JSON.stringify(successMsg));
        });
    });
    app.delete("/sadmin/feedback/delete",acl.middleware(1),function(req,res){
        var feedbackid = req.body.feedbackid;
        if(feedbackid&&ObjectID.isValid(feedbackid)){
            Admin.deleteFeedbackList(feedbackid,function(err,msg){
                if(msg == "notfound"){
                    logger.logger.log("info","not found feedback",{
                        feedbackid:req.body.feedbackid
                    });
                    res.status(404);
                    errorMsg.code = "feedback not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    logger.logger.log("info","ok delete feedback",{
                        feedbackid:req.body.feedbackid
                    });
                    res.status(200);
                    successMsg.body = "ok";
                    res.send(JSON.stringify(successMsg));
                }
            });
        }else{
            logger.logger.log("info","wrong feedback",{
                feedbackid:req.body.feedbackid
            });
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.post("/admin/version/add",acl.middleware(2),function(req,res){
        var platform = req.body.platform;
        var versionnum = req.body.versionnum;
        var fileurl = req.body.fileurl;
        if(platform && versionnum && fileurl){
            Admin.addVersion(req.session.orgid,platform,versionnum,fileurl,function(err,msg){
                logger.logger.log("info","admin add new version",{
                    adminid:req.session.uid,
                    versionid:msg
                });
                res.status(200);
                successMsg.body = msg;

                res.send(JSON.stringify(successMsg));
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });


    function datenum(v, date1904) {
        if(date1904) v+=1462;
        var epoch = Date.parse(v);
        return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
    }
    function sheet_from_array_of_arrays(data, opts) {
        var ws = {};
        var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
        for(var R = 0; R != data.length; ++R) {
            for(var C = 0; C != data[R].length; ++C) {
                if(range.s.r > R) range.s.r = R;
                if(range.s.c > C) range.s.c = C;
                if(range.e.r < R) range.e.r = R;
                if(range.e.c < C) range.e.c = C;
                var cell = {v: data[R][C] };
                if(cell.v == null) continue;
                var cell_ref = XLSX.utils.encode_cell({c:C,r:R});

                if(typeof cell.v === 'number') cell.t = 'n';
                else if(typeof cell.v === 'boolean') cell.t = 'b';
                else if(cell.v instanceof Date) {
                    cell.t = 'n'; cell.z = XLSX.SSF._table[14];
                    cell.v = datenum(cell.v);
                }
                else cell.t = 's';

                ws[cell_ref] = cell;
            }
        }
        if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
        return ws;
    }

    app.post("/admin/exportxlsx",acl.middleware(2),function(req,res){
        //var data = [[1,2,3],[true, false, null, "sheetjs"],["foo","bar",new Date("2014-02-19T14:30Z"), "0.3"], ["baz", null, "qux"]]
        var data = req.body.data;
        var name = req.body.name?req.body.name:"test";
        name = name.replace(/\s+/g,"_") + ".xlsx";
        var ws_name = "SheetJS";

        function Workbook() {
            if(!(this instanceof Workbook)) return new Workbook();
            this.SheetNames = [];
            this.Sheets = {};
        }

        var wb = new Workbook(), ws = sheet_from_array_of_arrays(data);

        /* add worksheet to workbook */
        wb.SheetNames.push(ws_name);
        wb.Sheets[ws_name] = ws;

        /* write file */
        XLSX.writeFile(wb, 'uploads/'+name);
        successMsg.body = name;

        res.send(JSON.stringify(successMsg));

    });

    app.get("/sadmin/version/list",acl.middleware(1),function(req,res){
        Admin.getSadminVersionList(function(err,msg){
            res.status(200);
            successMsg.body = msg;
            res.send(JSON.stringify(successMsg));
        })
    });

    app.post("/sadmin/version/add",acl.middleware(1),function(req,res){
        var platform = req.body.platform;
        var versionnum = req.body.versionnum;
        var fileurl = req.body.fileurl;
        if(platform && versionnum && fileurl){
            Admin.addSadminVersion(platform,versionnum,fileurl,function(err,msg){
                logger.logger.log("info","admin add new version",{
                    adminid:req.session.uid,
                    versionid:msg
                });
                res.status(200);
                successMsg.body = msg;

                res.send(JSON.stringify(successMsg));
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }




    });

    app.put("/sadmin/version/edit",acl.middleware(1),function(req,res){
        var versionid = req.body.id;
        var platform = req.body.platform;
        var versionnum = req.body.versionnum;
        var fileurl = req.body.fileurl;
        if(versionid&&ObjectID.isValid(versionid)&&platform&&versionnum&&fileurl){
            Admin.editSadminVersion(versionid,platform,versionnum,fileurl,function(err,msg){
                if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "version not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    res.status(200);
                    successMsg.body = "ok";
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

    app.delete("/sadmin/version/delete",acl.middleware(1),function(req,res){
        var versionid = req.body.id;

        if(versionid&&ObjectID.isValid(versionid)){
            Admin.deleteSadminVersion(versionid,function(err,msg){
                if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "version not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    res.status(200);
                    successMsg.body = "ok";
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

    app.get("/investigator/version/get/:platform",acl.middleware(2),function(req,res){
        var platform = req.params.platform;
        if(platform &&
            (platform == dict.PLATFORMTYPE_ANDROID || platform == dict.PLATFORMTYPE_IOS || platform==dict.PLATFORMTYPE_WEB)){
            Staff.getVersionInfo(platform,function(err,msg){
                logger.logger.log("info","staff get version info",{
                    staffid:req.session.uid,
                });
                res.status(200);
                successMsg.body = msg;

                res.send(JSON.stringify(successMsg));
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.post("/admin/ad/add",acl.middleware(2),function(req,res){
        var title = req.body.title;
        var image = req.body.image;
        var link = req.body.link;
        if(title && image && link){
            Admin.addAd(req.session.orgid,title,image,link,function(err,msg){
                logger.logger.log("info","admin add new ad",{
                    adminid:req.session.uid,
                    adid:msg
                });
                res.status(200);
                successMsg.body = msg;

                res.send(JSON.stringify(successMsg));
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.get("/investigator/ad/get",acl.middleware(2),function(req,res){
        Staff.getAdInfo(req.session.orgid,function(err,ads){
            logger.logger.log("info","staff get ad info",{
                staffid:req.session.uid
            });
            res.status(200);
            successMsg.body = ads;

            res.send(JSON.stringify(successMsg));
        })
    });

    //var from = "ouresateam@163.com";
    //var smtpTransport = nodemailer.createTransport('smtps://ouresateam%40163.com:ouresa777@smtp.163.com');

    //var from = "leochen.shanghai@gmail.com";
    //var smtpTransport = nodemailer.createTransport('smtps://leochen.shanghai%40gmail.com:Bobo16188@smtp.gmail.com');

    //var from = "admin@register.ouresa.com"
    //var smtpTransport = nodemailer.createTransport('smtps://postmaster%40register.ouresa.com:0dfe4400ba798ead05bb59328fc765e7@smtp.mailgun.org')

    //var from = "ouresaadmin@sandbox7ec8af3e18ce44239f48a365be400e76.mailgun.org"
    //var smtpTransport = nodemailer.createTransport('smtps://postmaster%40sandbox7ec8af3e18ce44239f48a365be400e76.mailgun.org:aa790a31986ac6dc171ddf4dfd1da8bc@smtp.mailgun.org')

    var from = "ouresa.pp@transsion.com"
    //var smtpTransport = nodemailer.createTransport('smtps://ouresa.pp%40transsion.com:ouresaPP666@smtp.qiye.163.com')

    var smtpTransport = nodemailer.createTransport({
            host: 'smtp.qiye.163.com',
            port: 465,
            auth: {
                user: "ouresa.pp@transsion.com",
                pass: 'ouresaPP666'
            },
            tls: {rejectUnauthorized: false},
            debug:true
        }
    );
    app.get("/testemail",function(req,res){

        //var smtpTransport = nodemailer.createTransport('smtps://leochen.shanghai%40gmail.com:Bobo16188@smtp.gmail.com');
        //var smtpTransport = nodemailer.createTransport('smtp://ouresateam%40sina.com:ouresa666@smtp.sina.com');

        var mailOptions = {
            from: from,
            to: "leochen.shanghai@qq.com",
            subject: "Account Verified Code",
            text: "Your Ouresa account verified code is 23457867885. Please input it into register form."
        }
        smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(error);
                res.status(500);
                errorMsg.code = "wrong";
                res.send(JSON.stringify(errorMsg));
            }else{
                console.log("ok");
                res.status(200);
                successMsg.body = "ok";

                res.send(JSON.stringify(successMsg));
            }
        });
    });

    app.post("/sendverifiedcode",function(req,res){
        var email = req.body.email;
        var ccode = req.body.capchacode;

        if(email && ccode){
            Admin.checkCapcha(ccode,req.session.captchaid,function(err,msg){
                if(msg!="notfound"){
                    Admin.generateVerifiedCode(email,function(err,msg){
                        var mailOptions = {
                            from: from,
                            to: email,
                            subject: "Account Verified Code",
                            text: "Your Ouresa account verified code is "+msg+". Please input it into register form."
                        };
                        smtpTransport.sendMail(mailOptions, function(error, response){
                            if(error){
                                console.log(error);
                                res.status(500);
                                errorMsg.code = "wrong";
                                res.send(JSON.stringify(errorMsg));
                            }else{
                                console.log("ok");
                                res.status(200);
                                successMsg.body = "ok";

                                res.send(JSON.stringify(successMsg));
                            }
                        });
                    })
                }
                else{
                    res.status(406);
                    errorMsg.code = "wrong";
                    res.send(JSON.stringify(errorMsg));
                }
            })

        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.post("/addpersonalfree",function(req,res){
        var name = req.body.name;
        var pass = req.body.password;
        var email = req.body.email;
        var verifiedcode = req.body.verifiedcode;

        if(name && pass && email && verifiedcode){
            Admin.checkVerifiedCode(email,verifiedcode,function(err,msg){
                if(msg){
                    var orgname = "__personal"+name;
                    if(orgname){
                        Admin.createOrganization(orgname,function(err,msg,insertedid){
                            if(msg == "duplicate"){
                                res.status(409);
                                errorMsg.code = "duplicate";
                                res.send(JSON.stringify(errorMsg));
                            }
                            else{
                                logger.logger.log("info","new organization created",{name:msg.name});
                                var orgid = insertedid.toString();
                                Admin.createOrgAdminWithEmail(orgid,name,pass,email,dict.STAFF_PERSONAL,function(err,msg,insertedid){
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

                                        acl.addUserRoles(msg.name, dict.STAFF_PERSONAL);
                                        Admin.deleteVerifiedCode(email,verifiedcode,function(err,msg){
                                            res.status(200);
                                            successMsg.body = insertedid;
                                            res.send(JSON.stringify(successMsg));
                                        })
                                    }
                                })
                            }
                        })
                    }
                    else{
                        res.status(406);
                        errorMsg.code = "wrong";
                        res.send(JSON.stringify(errorMsg));
                    }
                }
                else{
                    res.status(404);
                    errorMsg.code = "notmatched";
                    res.send(JSON.stringify(errorMsg));
                }
            })

        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.post("/addmobilepersonal",function(req,res){
        var name = req.body.username;
        var pass = req.body.password;
        var email = req.body.Email;

        console.log(name);

        if(name && pass && email){
            var orgname = "__personal"+name;
            if(orgname){
                Admin.createOrganization(orgname,function(err,msg,insertedid){
                    if(msg == "duplicate"){
                        res.status(409);
                        errorMsg.code = "duplicate";
                        res.send(JSON.stringify(errorMsg));
                    }
                    else{
                        logger.logger.log("info","new organization created",{name:msg.name});
                        var orgid = insertedid.toString();
                        Admin.createOrgAdminWithEmail(orgid,name,pass,email,dict.STAFF_PERSONAL,function(err,msg,insertedid){
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

                                acl.addUserRoles(msg.name, dict.STAFF_PERSONAL);
                                res.status(200);
                                successMsg.body = insertedid;
                                res.send(JSON.stringify(successMsg));

                            }
                        })
                    }
                })
            }
            else{
                res.status(406);
                errorMsg.code = "wrong";
                res.send(JSON.stringify(errorMsg));
            }

        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });


    app.post("/lookupfbid",function(req,res){
        var fbid = req.body.fbid;

        if(fbid){
            Admin.lookupFacebookId(fbid,function(err,msg){
                if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    res.status(200);
                    successMsg.body = msg;
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

    app.post("/addfbuser",function(req,res){
        var name = req.body.fbname;
        var pass = req.body.fbpass;
        var email = req.body.fbemail;
        var fbid = req.body.fbid;

        if(name && pass && email && fbid){

            var orgname = "__personal"+name;
            if(orgname){
                Admin.createOrganization(orgname,function(err,msg,insertedid){
                    if(msg == "duplicate"){
                        res.status(409);
                        errorMsg.code = "duplicate";
                        res.send(JSON.stringify(errorMsg));
                    }
                    else{
                        logger.logger.log("info","new organization created",{name:msg.name});
                        var orgid = insertedid.toString();
                        Admin.createOrgAdminWithFbid(orgid,name,pass,email,fbid,dict.STAFF_PERSONAL,function(err,msg,insertedid){
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

                                acl.addUserRoles(msg.name, dict.STAFF_PERSONAL);
                                res.status(200);
                                successMsg.body = {
                                    id:insertedid,
                                    role:msg.role
                                };
                                res.send(JSON.stringify(successMsg));
                            }
                        })
                    }
                })
            }
            else{
                res.status(406);
                errorMsg.code = "wrong";
                res.send(JSON.stringify(errorMsg));
            }

        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    function sendAudioFile(file,res){
        var filename = path.basename(file);
        var mimetype = mime.lookup(file);

        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-type', mimetype);

        var filestream = fs.createReadStream(file);
        filestream.pipe(res);
    }


    function isFileExist(fname){
        try{
            var fstat = fs.lstatSync(fname);
            return fstat.isFile()
        }
        catch(e){
            return false;
        }
    }

    app.get("/getmp3/:fname",function(req,res){
        var fname = req.params.fname;

        if(fname){
            var array = fname.split(".");
            if(array.length == 2){
                var ext = array[array.length-1];
                if(ext == "amr"){
                    if(isFileExist("uploads/"+fname)){
                        var fmp3 = "uploads/"+array[0]+".mp3";
                        if(isFileExist(fmp3)){
                            sendAudioFile(fmp3,res)
                        }
                        else{
                            var parameters = ["-i","uploads/"+fname,fmp3];
                            var stream = avconv(parameters);
                            stream.on('exit', function() {
                                sendAudioFile(fmp3,res)
                            })
                        }


                    }
                    else{
                        res.status(406);
                        errorMsg.code = "wrong";
                        res.send(JSON.stringify(errorMsg));
                    }

                }
                else{
                    res.status(406);
                    errorMsg.code = "wrong";
                    res.send(JSON.stringify(errorMsg));
                }
            }
            else{
                res.status(406);
                errorMsg.code = "wrong";
                res.send(JSON.stringify(errorMsg));
            }


        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }

    });

    app.post("/resetpassword",function(req,res){
        var email = req.body.email;

        if(email){
            Admin.generatResetpassEmailCode(email,function(err,msg){
                if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "email not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    var mailOptions = {
                        from: from,
                        to: email,
                        subject: "Reset your password",
                        text: "Please click this link to reset your password: http://www.ouresa.com/si/public/#/resetpass/"+msg
                    };
                    smtpTransport.sendMail(mailOptions, function(error, response){
                        if(error){
                            console.log(error);
                            res.status(500);
                            errorMsg.code = "wrong";
                            res.send(JSON.stringify(errorMsg));
                        }else{
                            console.log("ok");
                            res.status(200);
                            successMsg.body = "ok";

                            res.send(JSON.stringify(successMsg));
                        }
                    });


                }
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.post("/resetpassfromcode",function(req,res){
        var code = req.body.code;
        var pass = req.body.pass;
        if(code && pass){
            Admin.resetPassWithCode(code,pass,function(err,msg){
                if(msg == "notfound"){
                    res.status(404);
                    errorMsg.code = "not found";
                    res.send(JSON.stringify(errorMsg));
                }
                else if(msg == "timeout"){
                    res.status(409);
                    errorMsg.code = "timeout";
                    res.send(JSON.stringify(errorMsg));
                }
                else{
                    res.status(200);
                    successMsg.body = "ok";

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

function checkSurveyData(data){
    if(!data){
        return false;
    }
    else if(!data.surveyid){
        return false;
    }
    else if(!data.type || (data.type!=dict.QTYPE_DESCRIPTION &&
        data.type!=dict.QTYPE_MULTISELECT &&
        data.type!=dict.QTYPE_SEQUENCE &&
        data.type!=dict.QTYPE_SINGLESELECT &&
        data.type!=dict.QTYPE_SCORE &&
        data.type!=dict.QTYPE_DESCRIPTION_IMAGE_TEXT &&
        data.type!=dict.QTYPE_DESCRIPTION_RECORD_TEXT &&
        data.type!=dict.QTYPE_MULTISELECT_RECORD_TEXT &&
        data.type!=dict.QTYPE_MULTISELECT_TEXT &&
        data.type!=dict.QTYPE_SINGLESELECT_RECORD_TEXT &&
        data.type!=dict.QTYPE_SINGLESELECT_TEXT)){
        return false;
    }
    //else if(!data.title){
    //    return false;
    //}
    //else if((data.type == dict.QTYPE_MULTISELECT ||
    //    data.type == dict.QTYPE_SEQUENCE ||
    //    data.type == dict.QTYPE_SINGLESELECT ||
    //    data.type == dict.QTYPE_SCORE) &&
    //    !_.isArray(data.selectlist)){
    //    return false;
    //}
    //else if(data.type == dict.QTYPE_MULTISELECT ||
    //    data.type == dict.QTYPE_SEQUENCE ||
    //    data.type == dict.QTYPE_SINGLESELECT ||
    //    data.type == dict.QTYPE_SCORE){
    //    for(var i in data.selectlist){
    //        var q = data.selectlist[i];
    //        if(q.type!=dict.SELECTTYPE_AUDIO &&
    //            q.type!=dict.SELECTTYPE_DESCRIPTION &&
    //            q.type!=dict.SELECTTYPE_IMAGE &&
    //            q.type!=dict.SELECTTYPE_TEXT &&
    //            q.type!=dict.SELECTTYPE_VIDEO){
    //            return false;
    //        }
    //    }
    //}
    //else if(data.precederid){
    //    if(!data.precederselectindex){
    //        return false;
    //    }
    //}

    return true;


}

function parseV1List(input){
    var qlist = [];
    var typemap = {
        "0":dict.QTYPE_SINGLESELECT,
        "1":dict.QTYPE_MULTISELECT,
        "2":dict.QTYPE_DESCRIPTION,
        "3":dict.QTYPE_SEQUENCE,
        "4":dict.QTYPE_SCORE
    }

    for(var i in input){

        var q = {}
        if(i>=1){
            if(input[i][1] && input[i][2]){
                q.title = input[i][1].trim();
                q.type = typemap[input[i][2].trim()]
                q.selectlist = [];
                var start = 3;
                while(input[i][start]){
                    q.selectlist.push({
                        type:"textselect",
                        title:input[i][start].trim()
                    });
                    start+=1;
                }
                qlist.push(q)
            }


        }
    }
    return qlist;
}

function parseV2List(input){
    var qlist = [];
    var typemap = {
        "单选题":dict.QTYPE_SINGLESELECT,
        "多选题":dict.QTYPE_MULTISELECT,
        "描述题":dict.QTYPE_DESCRIPTION,
        "选项排序题":dict.QTYPE_SEQUENCE,
        "选项打分题":dict.QTYPE_SCORE
    };


    for(var i in input){

        var q = {}
        if(i>=2){
            if(input[i][1] && input[i][2]){
                var titleSplit = input[i][1].trim().split(",");
                var tindex = titleSplit[0]
                if(titleSplit.length==3){
                    var preindex = parseInt(titleSplit[1]);
                    var selectindex = parseInt(titleSplit[2]);
                    q.ifhasprecedent = true;
                    q.precedentindex = preindex-1;
                    q.precedentselectindex = selectindex-1;
                }
                else{
                    q.ifhasprecedent = false;
                    q.precedentindex = -1;
                    q.precedentselectindex = -1;
                }
                q.title = input[i][2].trim();
                q.type = typemap[tindex]
                q.selectlist = [];
                var start = 3;
                while(input[i][start]){
                    var stype = dict.SELECTTYPE_TEXT;
                    var vtrim = input[i][start].trim();

                    if(vtrim == "图形"){
                        stype = dict.SELECTTYPE_IMAGE;
                        vtrim = ""
                    }
                    else if(vtrim == "视频"){
                        stype = dict.SELECTTYPE_VIDEO;
                        vtrim = ""
                    }
                    else if(vtrim.indexOf("others")>=0 || vtrim.indexOf("Others")>=0){
                        stype = dict.SELECTTYPE_DESCRIPTION;
                    }

                    q.selectlist.push({
                        type:stype,
                        title:vtrim
                    });
                    start+=1;
                }
                qlist.push(q)
            }


        }
    }
    return qlist;
}

function parseV3List(input){
    var qlist = [];
    var typemap = {
        "单选题":dict.QTYPE_SINGLESELECT,
        "单选文本题":dict.QTYPE_SINGLESELECT_TEXT,
        "单选录音文本题":dict.QTYPE_SINGLESELECT_RECORD_TEXT,
        "多选题":dict.QTYPE_MULTISELECT,
        "多选文本题":dict.QTYPE_MULTISELECT_TEXT,
        "多选录音文本题":dict.QTYPE_MULTISELECT_RECORD_TEXT,
        "文本题":dict.QTYPE_DESCRIPTION,
        "录音文本题":dict.QTYPE_DESCRIPTION_RECORD_TEXT,
        "图片上传文本题":dict.QTYPE_DESCRIPTION_IMAGE_TEXT,
        "选项排序题":dict.QTYPE_SEQUENCE,
        "数字题":dict.QTYPE_SCORE
    };


    for(var i in input){

        var q = {}
        if(i>=2){
            if(input[i][1] && input[i][2]){
                var titleSplit = input[i][1].trim().split(",");
                var tindex = titleSplit[0]
                if(titleSplit.length==3){
                    var preindex = parseInt(titleSplit[1]);
                    var selectindex = parseInt(titleSplit[2]);
                    q.ifhasprecedent = true;
                    q.precedentindex = preindex-1;
                    q.precedentselectindex = selectindex-1;
                }
                else{
                    q.ifhasprecedent = false;
                    q.precedentindex = -1;
                    q.precedentselectindex = -1;
                }
                q.title = input[i][2].trim();
                q.type = typemap[tindex]
                q.selectlist = [];
                q.scorelist = [];
                var start = 3;
                while(input[i][start]){
                    var stype = dict.SELECTTYPE_TEXT;
                    var vtrim = input[i][start].trim();
                    if(q.type == dict.QTYPE_SCORE){
                        var scoreSplit = vtrim.split(",");
                        if(scoreSplit.length == 3){
                            q.scorelist.push({
                                index:parseInt(start)-3,
                                start:scoreSplit[0],
                                end:scoreSplit[1],
                                step:scoreSplit[2]
                            })
                        }
                        else if(scoreSplit.length == 4){
                            q.scorelist.push({
                                index:i,
                                start:scoreSplit[1],
                                end:scoreSplit[2],
                                step:scoreSplit[3]
                            })
                            q.selectlist.push({
                                type:stype,
                                title:scoreSplit[0]
                            })
                        }
                    }
                    else{
                        if(vtrim == "*图形*"){
                            stype = dict.SELECTTYPE_IMAGE;
                            vtrim = ""
                        }
                        else if(vtrim == "*视频*"){
                            stype = dict.SELECTTYPE_VIDEO;
                            vtrim = ""
                        }
                        else if(vtrim.indexOf("others")>=0 || vtrim.indexOf("Others")>=0){
                            stype = dict.SELECTTYPE_DESCRIPTION;
                        }

                        q.selectlist.push({
                            type:stype,
                            title:vtrim
                        });
                    }

                    start+=1;
                }
                qlist.push(q)
            }


        }
    }
    return qlist;
}

function parseV4List(input){
    console.log("It is 4 version")
    var qlist = [];
    var typemap = {
        "单选题":dict.QTYPE_SINGLESELECT,
        "单选文本题":dict.QTYPE_SINGLESELECT_TEXT,
        "单选录音文本题":dict.QTYPE_SINGLESELECT_RECORD_TEXT,
        "多选题":dict.QTYPE_MULTISELECT,
        "多选文本题":dict.QTYPE_MULTISELECT_TEXT,
        "多选录音文本题":dict.QTYPE_MULTISELECT_RECORD_TEXT,
        "文本题":dict.QTYPE_DESCRIPTION,
        "录音文本题":dict.QTYPE_DESCRIPTION_RECORD_TEXT,
        "图片上传文本题":dict.QTYPE_DESCRIPTION_IMAGE_TEXT,
        "选项排序题":dict.QTYPE_SEQUENCE,
        "数字题":dict.QTYPE_SCORE
    };


    for(var i in input){

        var q = {}
        var jumpArray = []
        if(i>=2){
            if(input[i][1] && input[i][2]){
                var titleSplit = input[i][1].trim().split(",");
                var tindex = titleSplit[0]
                if(titleSplit.length>1){
                    var arrayLength = titleSplit.length;

                    var firstPos = 1;
                    var nextPos = 2;



                    while(firstPos<arrayLength && nextPos<arrayLength){
                        var selectindex = parseInt(titleSplit[firstPos]);
                        var questionindex = parseInt(titleSplit[nextPos]);
                        jumpArray.push([selectindex,questionindex]);
                        firstPos += 2;
                        nextPos += 2;
                    }
                }

                q.title = input[i][2].trim();
                q.type = typemap[tindex]
                q.selectlist = [];
                q.scorelist = [];
                var start = 3;
                while(input[i][start]){
                    var stype = dict.SELECTTYPE_TEXT;
                    var vtrim = input[i][start].trim();

                    var selectIndex = parseInt(start)-3;

                    if(q.type == dict.QTYPE_SCORE){
                        var scoreSplit = vtrim.split(",");
                        if(scoreSplit.length == 3){
                            q.scorelist.push({
                                index:parseInt(start)-3,
                                start:scoreSplit[0],
                                end:scoreSplit[1],
                                step:scoreSplit[2]
                            })
                        }
                        else if(scoreSplit.length == 4){
                            q.scorelist.push({
                                index:parseInt(start)-3,
                                start:scoreSplit[1],
                                end:scoreSplit[2],
                                step:scoreSplit[3],
                                title:scoreSplit[0]
                            });
                        }
                    }
                    else{
                        if(vtrim == "*图形*"){
                            stype = dict.SELECTTYPE_IMAGE;
                            vtrim = ""
                        }
                        else if(vtrim == "*视频*"){
                            stype = dict.SELECTTYPE_VIDEO;
                            vtrim = ""
                        }
                        else if(vtrim.indexOf("###,")==0){
                            stype = dict.SELECTTYPE_DESCRIPTION;
                            vtrim = vtrim.slice(4);
                        }
                        var qindex = -1;
                        for(var jumpindex in jumpArray){
                            var jpair = jumpArray[jumpindex];
                            if(jpair[0] - 1 == parseInt(selectIndex)){
                                qindex = jpair[1] - 1;
                            }
                        }

                        q.selectlist.push({
                            type:stype,
                            title:vtrim,
                            qindex:qindex
                        });
                    }

                    start+=1;
                }
                qlist.push(q)
            }


        }
    }
    return qlist;
}


var server = app.listen(8080, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port)

});

