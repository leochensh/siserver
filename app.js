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
app.use(bodyParser.json());


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

        if(name && ObjectID.isValid(surveyid)){
            Staff.editSurvey(name,surveyid,function(err,msg){
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
    })

    app.get('/investigator/survey/list',acl.middleware(2),function(req,res){
        Staff.getStaffSurveyList(req.session.uid,function(err,msg){
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
    })

    app.post("/investigator/survey/answer/add",acl.middleware(2),function(req,res){
        var surveyid = req.body.surveyid;
        var investigatorid = req.session.uid;
        if(surveyid && ObjectID.isValid(surveyid) && investigatorid &&
            ObjectID.isValid(investigatorid) && req.body.answerlist){
            Staff.saveAnswers(req.body,investigatorid,function(err,msg){
                logger.logger.log("info","staff send survey answer",{
                    staffid:req.session.uid,
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
        var typemap = {
            "0":dict.QTYPE_SINGLESELECT,
            "1":dict.QTYPE_MULTISELECT,
            "2":dict.QTYPE_DESCRIPTION,
            "3":dict.QTYPE_SEQUENCE,
            "4":dict.QTYPE_SCORE
        }
        if(file){
            fs.readFile("./uploads/"+file,function(err,data){
                parse(data,function(err,output){
                    var qlist = [];
                    for(var i in output){
                        var q = {}
                        if(i>=1){
                            if(output[i][1] && output[i][2]){
                                q.title = output[i][1].trim();
                                q.type = typemap[output[i][2].trim()]
                                q.selectlist = [];
                                var start = 3;
                                while(output[i][start]){
                                    q.selectlist.push({
                                        type:"textselect",
                                        title:output[i][start].trim()
                                    });
                                    start+=1;
                                }
                                qlist.push(q)
                            }


                        }
                    }
                    successMsg.body = qlist;
                    res.send(JSON.stringify(successMsg));
                })
            })
        }
        else{
            res.status(406);
            errorMsg.code = "wrong";
            res.send(JSON.stringify(errorMsg));
        }
    });

    app.post("/investigator/feedback",acl.middleware(),function(req,res){
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
    app.get("/investigator/version/get/:platform",acl.middleware(2),function(req,res){
        var platform = req.params.platform;
        if(platform &&
            (platform == dict.PLATFORMTYPE_ANDROID || platform == dict.PLATFORMTYPE_IOS || platform==dict.PLATFORMTYPE_WEB)){
            Staff.getVersionInfo(req.session.orgid,platform,function(err,msg){
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
        data.type!=dict.QTYPE_SCORE)){
        return false;
    }
    else if(!data.title){
        return false;
    }
    else if((data.type == dict.QTYPE_MULTISELECT ||
        data.type == dict.QTYPE_SEQUENCE ||
        data.type == dict.QTYPE_SINGLESELECT ||
        data.type == dict.QTYPE_SCORE) &&
        !_.isArray(data.selectlist)){
        return false;
    }
    else if(data.type == dict.QTYPE_MULTISELECT ||
        data.type == dict.QTYPE_SEQUENCE ||
        data.type == dict.QTYPE_SINGLESELECT ||
        data.type == dict.QTYPE_SCORE){
        for(var i in data.selectlist){
            var q = data.selectlist[i];
            if(q.type!=dict.SELECTTYPE_AUDIO &&
                q.type!=dict.SELECTTYPE_DESCRIPTION &&
                q.type!=dict.SELECTTYPE_IMAGE &&
                q.type!=dict.SELECTTYPE_TEXT &&
                q.type!=dict.SELECTTYPE_VIDEO){
                return false;
            }
        }
    }
    else if(data.precederid){
        if(!data.precederselectindex){
            return false;
        }
    }

    return true;


}

var server = app.listen(8080, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port)

});

