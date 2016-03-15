var express = require('express');
var serveStatic = require('serve-static');
var ObjectID=require('mongodb').ObjectID;
var _ = require("underscore");

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
            Admin.createOrgAdmin(orgid,name,pass,function(err,msg,insertedid){
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
    })
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

