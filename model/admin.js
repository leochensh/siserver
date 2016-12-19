var mongoPool = require("../db");
var dict = require("../dict")
var Admin = {};
var async = require("async")
var ObjectID=require('mongodb').ObjectID;
var _ = require("underscore");
var randomstring = require("randomstring");
var ccap = require('ccap');


module.exports = Admin;

const crypto = require('crypto');

Admin.firstPageVisit = function(ip,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("visit",function(err,collection){
                var visit = {
                    ip:ip,
                    ctime:new Date()
                };
                collection.insertOne(visit,function(err,admin){
                    mongoPool.release(db);
                    callback(err,"ok");
                })
            });
        }
    });
}

Admin.firstPageVisitCount = function(callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("visit",function(err,collection){

                collection.find().count(function(err,count){
                    mongoPool.release(db);
                    callback(err,count);
                })
            });
        }
    });
}

Admin.apkDownload = function(ip,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("apkdownload",function(err,collection){
                var visit = {
                    ip:ip,
                    ctime:new Date()
                };
                collection.insertOne(visit,function(err,admin){
                    db.collection("versions",function(err,versioncollection){
                        versioncollection.find().sort({_id:-1}).limit(1).next(function(err,ver){
                            if(ver){
                                mongoPool.release(db);
                                callback(err,ver);
                            }
                            else{
                                mongoPool.release(db);
                                callback(err,"notfound");
                            }
                        })
                    });
                })
            });
        }
    });
}

Admin.apkDownloadCount = function(callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("apkdownload",function(err,collection){
                collection.find().count(function(err,count){
                    mongoPool.release(db);
                    callback(err,count);
                })
            });
        }
    });
}

Admin.createSuperAdmin = function(passhash,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("admins",function(err,collection){
                collection.find({name:"superadmin"}).limit(1).next(function(err,admin){
                    if(admin){
                        mongoPool.release(db);
                        callback(err,"exist");
                    }
                    else{
                        const hash = crypto.createHash('md5');
                        hash.update(passhash);
                        var superadmin = {
                            name:"superadmin",
                            passhash:hash.digest('hex'),
                            ctime:new Date(),
                            disable:false,
                            role:"sadmin"
                        };
                        collection.insertOne(superadmin,function(err,admin){
                            mongoPool.release(db);
                            callback(err,"ok");
                        })
                    }
                });
            });
        }
    });
};

Admin.login = function(uname,pass,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("admins",function(err,collection){
                collection.find({name:uname,passhash:pass}).limit(1).next(function(err,admin){
                    console.log(admin)
                    if(admin){
                        if(admin.disable){
                            callback(err,"error");
                        }
                        else{
                            callback(err,admin);
                        }
                        mongoPool.release(db);

                    }
                    else{

                        mongoPool.release(db);
                        callback(err,"error");
                    }
                });
            });
        }
    });
};

Admin.createOrganization = function(orgname,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("organization",function(err,collection){

                collection.find({name:orgname}).limit(1).next(function(err,org){
                    if(org){
                        mongoPool.release(db);
                        callback(err,"duplicate");
                    }
                    else{
                        var neworg = {
                            name:orgname,
                            ctime:new Date()
                        };
                        collection.insertOne(neworg,function(err,org){
                            mongoPool.release(db);
                            callback(err,neworg,org.insertedId);
                        })
                    }
                });
            });
        }
    });
};

Admin.getOrgList = function(callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("organization",function(err,collection){

                collection.find().toArray(function(err,orgs){
                    var forgs = _.filter(orgs,function(org){
                        return org.name.indexOf("__personal")<0;
                    });
                    mongoPool.release(db);
                    callback(err,forgs);
                });
            });
        }
    });
}
Admin.getFeedbackList = function(callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }else{
            db.collection("feedbacks",function(err,collection){
                collection.find().sort({ctime:-1}).toArray(function(err,feedbacks){
                    if(feedbacks) {
                        async.forEach(feedbacks, function (fdk, cb) {
                            db.collection("admins", function (err, adcollection) {
                                adcollection.find({_id: ObjectID(fdk.staffid)}).limit(1).next(function (err, admin) {
                                    if (admin) {
                                        fdk.name = admin.name;
                                    }
                                    else {
                                        fdk.name = "not found";
                                    }
                                    cb();
                                });
                            });

                        }, function (err) {
                            // console.log(feedbacks);
                            mongoPool.release(db);
                            callback(err, feedbacks);

                        });
                    }else{
                        mongoPool.release(db);
                        callback(err,[]);
                    }
                });
            });
        }
    });
}
Admin.deleteFeedbackList = function(feedbackid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("feedbacks",function(err,collection){

                collection.find({_id:ObjectID(feedbackid)}).limit(1).next(function(err,fb){
                    if(fb){
                        collection.deleteOne({_id:ObjectID(feedbackid)},function(err,msg){
                            mongoPool.release(db);
                            callback(err,"ok");
                        });
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"notfound");
                    }
                })
            });
        }
    });
};
Admin.createOrgAdmin = function(orgid,name,pass,role,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("organization",function(err,collection){

                collection.find({_id:ObjectID(orgid)}).limit(1).next(function(err,org){
                    if(org){
                        db.collection("admins",function(err,adcollection){
                            adcollection.find({name:name}).limit(1).next(function(err,admin){
                                if(admin){
                                    mongoPool.release(db);
                                    callback(err,"nameduplicate");
                                }
                                else{

                                    var newadmin = {
                                        name:name,
                                        passhash:pass,
                                        orgid:orgid,
                                        ctime:new Date(),
                                        disable:false,
                                        role:role
                                    };
                                    adcollection.insertOne(newadmin,function(err,result){
                                        mongoPool.release(db);
                                        callback(err,newadmin,result.insertedId);
                                    })
                                }
                            });
                        });
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"orgnotfound");
                    }
                });
            });
        }
    });
};

Admin.resetPassWithCode = function(code,pass,callback){

    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("admins",function(err,admincollection){
                admincollection.find({passresetcode:code}).limit(1).next(function(err,admin){
                    if(admin){
                        var currentTime = new Date();
                        var oldtime = new Date(admin.passcodectime);

                        var tdiff = currentTime-oldtime;

                        if(tdiff>2*60*60*1000){ //larger than 2 hour
                            mongoPool.release(db);
                            callback(err,"timeout");
                        }
                        else{
                            admincollection.updateOne({passresetcode:code},
                                {$set:{passhash:pass,passresetcode:null}},function(err,msg){
                                    mongoPool.release(db);
                                    callback(err,msg);
                                })
                        }


                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"notfound");
                    }
                })
            });
        }
    });
};

Admin.generatResetpassEmailCode = function(email,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("admins",function(err,admincollection){
                admincollection.find({email:email}).limit(1).next(function(err,admin){
                    if(admin){
                        crypto.randomBytes(48,function(cerr,buf){
                            var codeStr = buf.toString("hex");
                            admincollection.updateOne({email:email},
                                {$set:{passresetcode:codeStr,passcodectime:new Date()}},function(err,msg){
                                    mongoPool.release(db);
                                    callback(err,codeStr);
                                })
                        })
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"notfound");
                    }
                })
            });
        }
    });
};

Admin.createOrgAdminWithEmail = function(orgid,name,pass,email,role,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("organization",function(err,collection){

                collection.find({_id:ObjectID(orgid)}).limit(1).next(function(err,org){
                    if(org){
                        db.collection("admins",function(err,adcollection){
                            adcollection.find({$or:[{name:name},{email:email}]}).limit(1).next(function(err,admin){
                                if(admin){
                                    mongoPool.release(db);
                                    callback(err,"nameduplicate");
                                }
                                else{

                                    var newadmin = {
                                        name:name,
                                        passhash:pass,
                                        email:email,
                                        orgid:orgid,
                                        ctime:new Date(),
                                        disable:false,
                                        role:role
                                    };
                                    adcollection.insertOne(newadmin,function(err,result){
                                        mongoPool.release(db);
                                        callback(err,newadmin,result.insertedId);
                                    })
                                }
                            });
                        });
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"orgnotfound");
                    }
                });
            });
        }
    });
};

Admin.createOrgAdminWithFbid = function(orgid,name,pass,email,fbid,role,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("organization",function(err,collection){

                collection.find({_id:ObjectID(orgid)}).limit(1).next(function(err,org){
                    if(org){
                        db.collection("admins",function(err,adcollection){
                            adcollection.find({$or:[{name:name},{email:email}]}).limit(1).next(function(err,admin){
                                if(admin){
                                    mongoPool.release(db);
                                    callback(err,"nameduplicate");
                                }
                                else{

                                    var newadmin = {
                                        name:name,
                                        passhash:pass,
                                        email:email,
                                        orgid:orgid,
                                        fbid:fbid,
                                        ctime:new Date(),
                                        disable:false,
                                        role:role
                                    };
                                    adcollection.insertOne(newadmin,function(err,result){
                                        mongoPool.release(db);
                                        callback(err,newadmin,result.insertedId);
                                    })
                                }
                            });
                        });
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"orgnotfound");
                    }
                });
            });
        }
    });
};


Admin.getOrgAdminList = function(orgid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("organization",function(err,collection){

                collection.find({_id:ObjectID(orgid)}).limit(1).next(function(err,org){
                    if(org){
                        db.collection("admins",function(err,adcollection){
                            adcollection.find({orgid:orgid,role:"admin",disable:false}).toArray(function(err,admins){
                                mongoPool.release(db);
                                callback(err,admins);
                            })
                        });
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"orgnotfound");
                    }
                });
            });
        }
    });
};

Admin.deleteAdmin = function(adminid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("admins",function(err,collection){
                collection.find({_id:ObjectID(adminid)}).limit(1).next(function(err,admin){
                    if(admin){
                        collection.updateOne({_id:ObjectID(adminid)},
                            {$set:{disable:true}},
                            function(err,msg){
                                mongoPool.release(db);
                                callback(err,msg);
                            })
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"notfound");
                    }
                })
            });
        }

    });
};

Admin.sadminResetAdminPass = function(adminid,pass,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("admins",function(err,collection){

                collection.find({_id:ObjectID(adminid)}).limit(1).next(function(err,admin){
                    if(admin){
                        collection.updateOne({_id:ObjectID(adminid)},{$set:{passhash:pass}},function(err,updatedata){
                            mongoPool.release(db);
                            callback(err,"ok")
                        });
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"notfound");
                    }
                });
            });
        }
    });
};

Admin.getPersonalList = function(callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("admins",function(err,collection){

                collection.find({role:dict.STAFF_PERSONAL}).sort({ctime:-1}).toArray(function(err,admins){
                    if(admins){
                        mongoPool.release(db);
                        callback(err,admins);
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,[]);
                    }
                });
            });
        }
    });
}
/*add by zzl 2016.8.29*/
Admin.getLogsList = function(callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("logs",function(err,collection){
                collection.find().sort({ctime:-1}).toArray(function(err,logs){
                    if(logs){
                        mongoPool.release(db);
                        callback(err,logs);
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,[]);
                    }
                });
            });
        }
    });

}
Admin.deletelogList = function(logid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("logs",function(err,collection){

                collection.find({_id:ObjectID(logid)}).limit(1).next(function(err,fb){
                    if(fb){
                        collection.deleteOne({_id:ObjectID(logid)},function(err,msg){
                            mongoPool.release(db);
                            callback(err,"ok");
                        });
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"notfound");
                    }
                })
            });
        }
    });
}
Admin.getOrgStaffList = function(orgid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("admins",function(err,collection){

                collection.find({role:dict.STAFF_ORG,orgid:orgid}).sort({ctime:-1}).toArray(function(err,admins){
                    if(admins){
                        mongoPool.release(db);
                        callback(err,admins);
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,[]);
                    }
                });
            });
        }
    });
}

Admin.getOrgAllUserList = function(orgid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("admins",function(err,collection){

                collection.find({orgid:orgid}).sort({ctime:-1}).toArray(function(err,admins){
                    if(admins){
                        mongoPool.release(db);
                        callback(err,admins);
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,[]);
                    }
                });
            });
        }
    });
}

Admin.sadminDisableAdmin = function(adminid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("admins",function(err,collection){

                collection.find({_id:ObjectID(adminid)}).limit(1).next(function(err,admin){
                    if(admin){
                        collection.updateOne({_id:ObjectID(adminid)},{$set:{disable:true}},function(err,updatedata){
                            mongoPool.release(db);
                            callback(err,"ok")
                        });
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"notfound");
                    }
                });
            });
        }
    });
};

Admin.changeAdminPass = function(adminname,oldpass,newpass,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("admins",function(err,collection){

                collection.find({name:adminname}).limit(1).next(function(err,admin){
                    if(admin){
                        if(admin.passhash != oldpass){
                            mongoPool.release(db);
                            callback(err,"errorpass");
                        }
                        else{
                            collection.updateOne({name:adminname},{$set:{passhash:newpass}},function(err,updatedata){
                                mongoPool.release(db);
                                callback(err,admin)
                            });
                        }

                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"notfound");
                    }
                });
            });
        }
    });
};

Admin.addStaff = function(orgid,name,role,pass,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("organization",function(err,collection){

                collection.find({_id:ObjectID(orgid)}).limit(1).next(function(err,org){
                    if(org){
                        db.collection("admins",function(err,adcollection){
                            adcollection.find({name:name}).limit(1).next(function(err,admin){
                                if(admin){
                                    mongoPool.release(db);
                                    callback(err,"nameduplicate");
                                }
                                else{

                                    var newstaff = {
                                        name:name,
                                        passhash:pass,
                                        orgid:orgid,
                                        role:role,
                                        ctime:new Date(),
                                        disable:false
                                    };
                                    adcollection.insertOne(newstaff,function(err,result){
                                        mongoPool.release(db);
                                        callback(err,newstaff,result.insertedId);
                                    })
                                }
                            });
                        });
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"orgnotfound");
                    }
                });
            });
        }
    });
};

Admin.resetStaffPass = function(orgid,staffid,pass,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("admins",function(err,collection){

                collection.find({_id:ObjectID(staffid)}).limit(1).next(function(err,admin){
                    if(admin && admin.orgid == orgid){
                        collection.updateOne({_id:ObjectID(staffid)},{$set:{passhash:pass}},function(err,updatedata){
                            mongoPool.release(db);
                            callback(err,admin)
                        });
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"notfound");
                    }
                });
            });
        }
    });
};

Admin.adminDisableStaff = function(orgid,staffid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("admins",function(err,collection){

                collection.find({_id:ObjectID(staffid)}).limit(1).next(function(err,admin){
                    if(admin && admin.orgid == orgid){
                        collection.updateOne({_id:ObjectID(staffid)},{$set:{disable:true}},function(err,updatedata){
                            mongoPool.release(admin);
                            callback(err,"ok")
                        });
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"notfound");
                    }
                });
            });
        }
    });
};

Admin.auditSurvey = function(orgid,surveyid,status,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("surveys",function(err,collection){
                collection.find({_id:ObjectID(surveyid)}).limit(1).next(function(err,survey){
                    if(survey){
                        if(survey.orgid != orgid){
                            callback(err,"forbidden");
                            mongoPool.release(db);
                        }
                        else{
                            collection.updateOne({_id:ObjectID(surveyid)},
                                {$set:{status:status}},function(err,upres){
                                    callback(err,upres);
                                    mongoPool.release(db);
                                });
                        }

                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"notfound")
                    }
                })
            });
        }
    });
};

Admin.publishSurveyToOwn = function(surveyid,uid,role,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("surveys",function(err,collection){
                collection.find({_id:ObjectID(surveyid)}).limit(1).next(function(err,survey){
                    if(survey){
                        if((role==dict.STAFF_PERSONAL || role == dict.STAFF_ORG) && survey.editorid != uid){
                            callback(err,"forbidden");
                            mongoPool.release(db);
                        }
                        else{
                            db.collection("admins",function(err,admincollection){
                                admincollection.find({_id:ObjectID(survey.editorid)}).limit(1).next(function(err,adm){
                                    if(adm){
                                        var pstatu = dict.SURVEYPUBLISHSTATUS_PRIVATEPERSONAL;
                                        if(adm.role == "admin" || adm.role == dict.STAFF_ORG){
                                            pstatu = dict.SURVEYPUBLISHSTATUS_PRIVATEORG;
                                        }
                                        collection.updateOne({_id:ObjectID(surveyid)},
                                            {$set:{status:dict.SURVEYSTATUS_NORMAL,
                                                publishstatus:pstatu,
                                                publishtime:new Date()}},function(err,upres){
                                                callback(err,upres);
                                                mongoPool.release(db);
                                            });
                                    }
                                    else{
                                        mongoPool.release(db);
                                        callback(err,"notfound")
                                    }
                                });
                            });


                        }
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"notfound")
                    }
                })
            });
        }
    });
};

Admin.publishSurveyToAll = function(surveyid,uid,role,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("surveys",function(err,collection){
                collection.find({_id:ObjectID(surveyid)}).limit(1).next(function(err,survey){
                    if(survey){
                        if(((role==dict.STAFF_PERSONAL || role == dict.STAFF_ORG) && survey.editorid != uid) || survey.status!=dict.SURVEYSTATUS_EDIT){
                            callback(err,"forbidden");
                            mongoPool.release(db);
                        }
                        else{
                            db.collection("admins",function(err,admincollection){
                                admincollection.find({_id:ObjectID(survey.editorid)}).limit(1).next(function(err,adm){
                                    if(adm){
                                        var pstatu = dict.SURVEYPUBLISHSTATUS_PUBLICPERSONAL;
                                        if(adm.role == "admin" || adm.role == dict.STAFF_ORG){
                                            pstatu = dict.SURVEYPUBLISHSTATUS_PUBLICORG;
                                        }
                                        collection.updateOne({_id:ObjectID(surveyid)},
                                            {$set:{status:dict.SURVEYSTATUS_PROPOSE,
                                                publishstatus:pstatu,
                                                publishtime:new Date()}},function(err,upres){
                                                callback(err,upres);
                                                mongoPool.release(db);
                                            });
                                    }
                                    else{
                                        mongoPool.release(db);
                                        callback(err,"notfound")
                                    }
                                });
                            });


                        }

                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"notfound")
                    }
                })
            });
        }
    });
};

Admin.temproryChangeSurvey = function(callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("surveys",function(err,collection){
                collection.find({status:dict.SURVEYSTATUS_NORMAL}).toArray(function(err,surveys){
                    async.each(surveys,function(survey,cb){
                        collection.updateOne({_id:survey._id},
                            {$set:{publishstatus:dict.SURVEYPUBLISHSTATUS_PRIVATEPERSONAL}},function(err,res){
                                cb()
                            });
                    },function(err){
                        mongoPool.release(db);
                        callback(err,"ok");
                    })
                })
            });
        }
    });
};

Admin.withdrawPublishSurvey = function(surveyid,uid,role,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("surveys",function(err,collection){
                collection.find({_id:ObjectID(surveyid)}).limit(1).next(function(err,survey){
                    if(survey){
                        if(role!="sadmin" && (survey.editorid != uid || survey.status == dict.SURVEYSTATUS_EDIT)){
                            callback(err,"forbidden");
                            mongoPool.release(db);
                        }
                        else{
                            collection.updateOne({_id:ObjectID(surveyid)},
                                {$set:{status:dict.SURVEYSTATUS_EDIT,
                                    publishstatus:null}},function(err,upres){
                                    callback(err,upres);
                                    mongoPool.release(db);
                                });
                        }

                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"notfound")
                    }
                })
            });
        }
    });
};

Admin.sadminAuditSurvey = function(surveyid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("surveys",function(err,collection){
                collection.find({_id:ObjectID(surveyid)}).limit(1).next(function(err,survey){
                    if(survey){
                        if(survey.status!=dict.SURVEYSTATUS_PROPOSE ||
                            (survey.publishstatus != dict.SURVEYPUBLISHSTATUS_PUBLICPERSONAL && survey.publishstatus != dict.SURVEYPUBLISHSTATUS_PUBLICORG)){
                            callback(err,"forbidden");
                            mongoPool.release(db);
                        }
                        else{

                            collection.updateOne({_id:ObjectID(surveyid)},
                                {$set:{status:dict.SURVEYSTATUS_NORMAL,
                                    audittime:new Date()}},function(err,upres){
                                    callback(err,upres);
                                    mongoPool.release(db);
                                });
                        }

                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"notfound")
                    }
                })
            });
        }
    });
};

Admin.createSpider = function(sname,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("spider",function(err,collection){
                collection.find({status:dict.SPIDERSTATU_ACTIVE}).limit(1).next(function(err,spider){
                    if(spider){
                        mongoPool.release(db);
                        callback(err,"BUSY");
                    }
                    else{
                        console.log("not found busy spider")
                        collection.find({name:sname}).sort({ctime:-1}).limit(1).next(function (err,newspider){
                            if(newspider){
                                var tdiff = new Date() - new Date(newspider.ctime);
                                if(tdiff<=3600*1000*24){
                                    mongoPool.release(db);
                                    callback(err,"QUICK");
                                }
                                else{
                                    var ns = {
                                        name:sname,
                                        ctime:new Date(),
                                        status:dict.SPIDERSTATU_ACTIVE
                                    };
                                    collection.insertOne(ns,function(err,result){
                                        mongoPool.release(db);
                                        callback(err,result.insertedId);
                                    })
                                }
                            }
                            else{
                                var ns = {
                                    name:sname,
                                    ctime:new Date(),
                                    status:dict.SPIDERSTATU_ACTIVE
                                };
                                collection.insertOne(ns,function(err,result){
                                    mongoPool.release(db);
                                    callback(err,result.insertedId);
                                })
                            }

                        })

                    }
                })
            });
        }
    });
};



Admin.stopSpider = function(callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("spider",function(err,collection){
                collection.find({status:dict.SPIDERSTATU_ACTIVE}).limit(1).next(function(err,spider){
                    if(spider){
                        collection.updateOne({_id:spider._id},
                            {$set:{status:dict.SPIDERSTATU_DONE,endtime:new Date()}},function(err,res){
                                mongoPool.release(db);
                                callback(err,res);
                            })
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"notfound");
                    }
                })
            });
        }
    });
};


var getSpiderCountInfo = function(spiderid,cb){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("brand",function(err,collection){
                collection.find({spiderid:spiderid}).count(function(err,bcount){

                    db.collection("model",function(err,modelcollection){
                        modelcollection.find({spiderid:spiderid}).count(function(err,mcount){
                            mongoPool.release(db);
                            cb(err,{
                                brandCount:bcount,
                                modelCount:mcount
                            });
                        })
                    })


                })
            });
        }
    });
};

Admin.getSpiderList = function(sname,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("spider",function(err,collection){
                collection.find({name:sname}).sort({ctime:-1}).toArray(function(err,sarray){
                    mongoPool.release(db);

                    async.map(sarray,function(item,cb){
                        getSpiderCountInfo(item._id.toString(),function (err,countinfo) {
                            item.brandcount = countinfo.brandCount;
                            item.modelcount = countinfo.modelCount;
                            cb(null,item);
                        })
                    },function (err,results) {
                        callback(err,results);
                    })
                })
            });
        }
    });
};

Admin.deleteSpider = function(sid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("brand",function(err,brandcollection){
                brandcollection.deleteMany({spiderid:sid},function(err,res){
                    db.collection("model",function(err,modelcollection){
                        modelcollection.deleteMany({spiderid:sid},function(err,res){
                            db.collection("spider",function(err,collection){
                                collection.deleteOne({_id:ObjectID(sid)},function(err,res){
                                    mongoPool.release(db);
                                    callback(err,res);
                                })
                            });
                        })
                    })
                })
            });

        }
    });
};

Admin.getSpiderActiveId = function(sname,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("spider",function(err,collection){
                collection.find({name:sname,status:dict.SPIDERSTATU_ACTIVE}).limit(1).next(function(err,activeitem){
                    mongoPool.release(db);
                    if(activeitem){
                        callback(err,activeitem._id)
                    }
                    else{
                        callback(err,"-10000");
                    }

                })
            });
        }
    });
};

Admin.getSpiderDetailData = function(sid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("model",function(err,collection){
                collection.find({spiderid:sid}).sort({brand:1}).toArray(function(err,models){
                    mongoPool.release(db);
                    callback(err,models);
                })
            });
        }
    });
}

Admin.getTop10modelnumForBrand = function(sid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("model",function(err,collection){
                collection.group(
                    ["brand"],
                    {"spiderid":{$eq:sid}},
                    {"count":0},
                    "function( curr, result ) {result.count += 1;}",

                    function(err,modelgroup){
                        console.log(modelgroup[0])
                        collection.find({spiderid:sid}).count(function(err,modelcount){
                            mongoPool.release(db);
                            var sortedA = _.sortBy(modelgroup,function(item){
                                return item.count
                            });
                            var rA = [];
                            if(sortedA.length>0){

                                var startPos = sortedA.length-1;
                                var count = 10;
                                while(startPos>=0 && count>0){
                                    rA.push(sortedA[startPos]);
                                    startPos-=1;
                                    count-=1;
                                }
                            }
                            callback(err,{
                                total:modelcount,
                                models:rA
                            })
                        })


                    })
            });
        }
    });
};

Admin.getTop10reviewnumForBrand = function(sid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("model",function(err,collection){
                collection.group(
                    ["brand"],
                    {"spiderid":{$eq:sid}},
                    {"count":0},
                    "function( curr, result ) {var rnum = curr.reviewNum; if(rnum==''||!rnum){rnum = 0;}else{rnum = parseInt(rnum);} result.count += rnum;}",

                    function(err,modelgroup){
                        mongoPool.release(db);

                        var total = _.reduce(modelgroup,function(memo,item){
                            return memo+item.count;
                        },0);

                        var sortedA = _.sortBy(modelgroup,function(item){
                            return item.count
                        });
                        var rA = [];
                        if(sortedA.length>0){

                            var startPos = sortedA.length-1;
                            var count = 10;
                            while(startPos>=0 && count>0){
                                rA.push(sortedA[startPos]);
                                startPos-=1;
                                count-=1;
                            }
                        }
                        callback(err,{
                            total:total,
                            models:rA
                        })


                    })
            });
        }
    });
}

Admin.getTop10salesamountForBrand = function(sid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("model",function(err,collection){
                collection.group(
                    ["brand"],
                    {"spiderid":{$eq:sid}},
                    {"count":0},
                    "function(curr,result){var rnum = parseInt(curr.reviewNum?curr.reviewNum:0);var price = parseInt(curr.price?curr.price:0);if(isNaN(rnum) || isNaN(price)){result.count += 0;}else{result.count += rnum*price; }}",
                    function(err,modelgroup){
                        mongoPool.release(db);

                        var total = _.reduce(modelgroup,function(memo,item){
                            return memo+item.count;
                        },0);

                        var sortedA = _.sortBy(modelgroup,function(item){
                            return item.count
                        });
                        var rA = [];
                        if(sortedA.length>0){

                            var startPos = sortedA.length-1;
                            var count = 10;
                            while(startPos>=0 && count>0){
                                rA.push(sortedA[startPos]);
                                startPos-=1;
                                count-=1;
                            }
                        }
                        callback(err,{
                            total:total,
                            models:rA
                        })


                    })
            });
        }
    });
}

Admin.getTop10avgpriceForBrand = function(sid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("model",function(err,collection){
                collection.group(
                    ["brand"],
                    {"spiderid":{$eq:sid}},
                    {"count":0,"totalPrice":0,"avgPrice":0},
                    "function(curr,result){result.count+=1;var price = parseInt(curr.price?curr.price:0);if(isNaN(price)){result.totalPrice+=0}else{result.totalPrice += price; }}",
                    function(err,modelgroup){
                        mongoPool.release(db);
                        modelgroup = _.map(modelgroup,function(item){
                            item.avgPrice = item.count?item.totalPrice/item.count:0;
                            return item;
                        })
                        var sortedA = _.sortBy(modelgroup,function(item){
                            return item.avgPrice
                        });
                        var rA = [];
                        if(sortedA.length>0){

                            var startPos = sortedA.length-1;
                            var count = 10;
                            while(startPos>=0 && count>0){
                                rA.push(sortedA[startPos]);
                                startPos-=1;
                                count-=1;
                            }
                        }
                        callback(err,{
                            models:rA
                        })


                    })
            });
        }
    });
}

Admin.getTop10reviewnumForModel = function(sid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("model",function(err,collection){
                collection.find({spiderid:sid}).sort({reviewNum:-1}).toArray(function(err,models){
                    var gmodels = _.groupBy(models,function(item){
                        return item.title.split("(")[0];
                    })

                    var count = 10;
                    var result = [];
                    for(var i in gmodels){
                        if(count>0){
                            result.push({
                                title:i,
                                reviewNum:gmodels[i][0].reviewNum
                            });
                            count -=1;
                        }
                    }
                    mongoPool.release(db);
                    callback(err,{
                        models:result
                    });
                })
            });
        }
    });
}

Admin.getTop10salesamountForModel = function(sid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("model",function(err,collection){
                collection.find({spiderid:sid}).toArray(function(err,models){
                    var gmodels = _.groupBy(models,function(item){
                        return item.title.split("(")[0];
                    });

                    var nextArray = [];
                    for(var title in gmodels){
                        var tmp = {
                            title:title,
                            reviewNum:gmodels[title][0].reviewNum?gmodels[title][0].reviewNum:0,
                            price:gmodels[title][0].price?gmodels[title][0].price:0
                        };
                        tmp.smount = tmp.reviewNum*tmp.price;
                        nextArray.push(tmp)
                    }

                    var sortarray = _.sortBy(nextArray,function(item){
                        return item.smount
                    })

                    var count = 10;
                    var countindex = sortarray.length-1;
                    var result = [];

                    while(countindex>=0 && count>0){
                        result.push(sortarray[countindex]);
                        countindex -= 1;
                        count -= 1;
                    }

                    mongoPool.release(db);
                    callback(err,{
                        models:result
                    });
                })
            });
        }
    });
}

Admin.getTop10priceForModel = function(sid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("model",function(err,collection){
                collection.find({spiderid:sid}).toArray(function(err,models){
                    var gmodels = _.groupBy(models,function(item){
                        return item.title.split("(")[0];
                    });

                    var nextArray = [];
                    for(var title in gmodels){
                        var tmp = {
                            title:title,
                            price:gmodels[title][0].price?gmodels[title][0].price:0,
                        };
                        nextArray.push(tmp)
                    }

                    var sortarray = _.sortBy(nextArray,function(item){
                        return item.price
                    })

                    var count = 10;
                    var countindex = sortarray.length-1;
                    var result = [];

                    while(countindex>=0 && count>0){
                        result.push(sortarray[countindex]);
                        countindex -= 1;
                        count -= 1;
                    }

                    mongoPool.release(db);
                    callback(err,{
                        models:result
                    });
                })
            });
        }
    });
}

Admin.getpricerangebynumForModel = function(sid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("model",function(err,collection){
                collection.find({spiderid:sid}).sort({price:1}).toArray(function(err,models){
                    var total = models.length;
                    var gmodels = _.groupBy(models,function(item){
                        if(!item.price){
                            return "Others";
                        }
                        else{
                            var p = parseInt(item.price);
                            if(p>0 && p<=10000){
                                return "0~10000";
                            }
                            else if(p>10000 && p<=20000){
                                return "10000~20000"
                            }
                            else if(p>20000 && p<=30000){
                                return "20000~30000"
                            }
                            else if(p>30000 && p<=40000){
                                return "30000~40000"
                            }
                            else if(p>40000 && p<=50000){
                                return "40000~50000"
                            }
                            else if(p>50000){
                                return "Above 50000"
                            }
                        }
                    });

                    var nextArray = [];
                    for(var title in gmodels){
                        var tmp = {
                            pricerange:title,
                            modelnum:gmodels[title].length,
                        };
                        nextArray.push(tmp)
                    }


                    mongoPool.release(db);
                    callback(err,{
                        models:nextArray,
                        total:total
                    });
                })
            });
        }
    });
}

Admin.getpricerangebyreviewnumForModel = function(sid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("model",function(err,collection){
                collection.find({spiderid:sid}).sort({price:1}).toArray(function(err,models){
                    var total = 0;
                    for(var mi in models){
                        if(models[mi].reviewNum){
                            total += parseInt(models[mi].reviewNum)
                        }
                    }
                    var gmodels = _.groupBy(models,function(item){
                        if(!item.price){
                            return "Others";
                        }
                        else{
                            var p = parseInt(item.price);
                            if(p>0 && p<=10000){
                                return "0~10000";
                            }
                            else if(p>10000 && p<=20000){
                                return "10000~20000"
                            }
                            else if(p>20000 && p<=30000){
                                return "20000~30000"
                            }
                            else if(p>30000 && p<=40000){
                                return "30000~40000"
                            }
                            else if(p>40000 && p<=50000){
                                return "40000~50000"
                            }
                            else if(p>50000){
                                return "Above 50000"
                            }
                        }
                    });

                    var nextArray = [];
                    for(var title in gmodels){
                        var rnum = 0;
                        for(var m in gmodels[title]){
                            rnum += gmodels[title][m].reviewNum?parseInt(gmodels[title][m].reviewNum):0
                        }

                        var tmp = {
                            pricerange:title,
                            reviewnum:rnum,
                        };
                        nextArray.push(tmp)
                    }


                    mongoPool.release(db);
                    callback(err,{
                        models:nextArray,
                        total:total
                    });
                })
            });
        }
    });
};

Admin.getpricerangebysalesamountForModel = function(sid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("model",function(err,collection){
                collection.find({spiderid:sid}).sort({price:1}).toArray(function(err,models){
                    var total = 0;
                    for(var mi in models){
                        if(models[mi].reviewNum && models[mi].price){
                            total += parseInt(models[mi].reviewNum)*parseInt(models[mi].price)
                        }
                    }
                    var gmodels = _.groupBy(models,function(item){
                        if(!item.price){
                            return "Others";
                        }
                        else{
                            var p = parseInt(item.price);
                            if(p>0 && p<=10000){
                                return "0~10000";
                            }
                            else if(p>10000 && p<=20000){
                                return "10000~20000"
                            }
                            else if(p>20000 && p<=30000){
                                return "20000~30000"
                            }
                            else if(p>30000 && p<=40000){
                                return "30000~40000"
                            }
                            else if(p>40000 && p<=50000){
                                return "40000~50000"
                            }
                            else if(p>50000){
                                return "Above 50000"
                            }
                        }
                    });

                    var nextArray = [];
                    for(var title in gmodels){
                        var amount = 0;
                        for(var m in gmodels[title]){
                            var rnum = gmodels[title][m].reviewNum?parseInt(gmodels[title][m].reviewNum):0
                            var pr = gmodels[title][m].price?parseInt(gmodels[title][m].price):0
                            amount += rnum*pr;
                        }

                        var tmp = {
                            pricerange:title,
                            salesamount:amount,
                        };
                        nextArray.push(tmp)
                    }


                    mongoPool.release(db);
                    callback(err,{
                        models:nextArray,
                        total:total
                    });
                })
            });
        }
    });
};

Admin.getcolorbymodelnumForModel = function(sid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("model",function(err,collection){
                collection.find({spiderid:sid}).toArray(function(err,models){
                    mongoPool.release(db);

                    var rval = groupAndSort(models,true,function(data){
                        return data.length;
                    },function(item){
                        if(!item.color){
                            return "Others";
                        }
                        else{
                            return item.color;
                        }
                    },function(item,title){
                        return {
                            color:title,
                            count:item.length
                        };
                    },null,true);
                    callback(err,rval);
                })
            });
        }
    });
};

Admin.getcolorbyreviewnumForModel = function(sid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("model",function(err,collection){
                collection.find({spiderid:sid}).toArray(function(err,models){
                    mongoPool.release(db);

                    var rval = groupAndSort(models,true,function(data){
                        var total = 0;
                        for(var mi in data){
                            if(data[mi].reviewNum){
                                total += parseInt(data[mi].reviewNum)
                            }
                        }
                        return total;
                    },function(item){
                        if(!item.color){
                            return "Others";
                        }
                        else{
                            return item.color;
                        }
                    },function(item,title){
                        var amount = 0;
                        for(var mi in item){
                            amount += item[mi].reviewNum?parseInt(item[mi].reviewNum):0
                        }
                        return {
                            color:title,
                            count:amount
                        };
                    },null,true);
                    callback(err,rval);
                })
            });
        }
    });
};

Admin.getcolorbyavgpriceForModel = function(sid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("model",function(err,collection){
                collection.find({spiderid:sid}).toArray(function(err,models){

                    mongoPool.release(db);

                    var rval = groupAndSort(models,false,null,function(item){
                        if(!item.color){
                            return "Others";
                        }
                        else{
                            return item.color;
                        }
                    },function(item,title){
                        var amount = 0;
                        var mcount = 0;
                        for(var mi in item){
                            if(item[mi].price){
                                var p = parseInt(item[mi].price);
                                amount += p;
                                mcount += 1;
                            }
                        }
                        return {
                            color:title,
                            count:amount/mcount
                        };
                    },null,true);
                    callback(err,rval);
                })
            });
        }
    });
};

function batteryTag(item){
    if(!item.battery){
        return "Others";
    }
    else{
        var match = item.battery.match(/(\d+)/);
        if (match){
            var intb = parseInt(match[1]);
            if(intb>=0 && intb<1000){
                return "0~1000mAh"
            }
            else if(intb>=1000 && intb<2000){
                return "1000~2000mAh"
            }
            else if(intb>=2000 && intb<3000){
                return "1000~2000mAh"
            }
            else if(intb>=3000){
                return "Above 3000mAh"
            }
        }
        else{
            return "Others"
        }
    }
}

Admin.getbatterybymodelnumForModel = function(sid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("model",function(err,collection){
                collection.find({spiderid:sid}).toArray(function(err,models){
                    mongoPool.release(db);

                    var rval = groupAndSort(models,true,function(data){
                        return data.length;
                    },function(item){
                        return batteryTag(item);
                    },function(item,title){
                        return {
                            batteryrange:title,
                            count:item.length
                        };
                    },null,true);
                    callback(err,rval);
                })
            });
        }
    });
};

Admin.getbatterybyreviewnumForModel = function(sid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("model",function(err,collection){
                collection.find({spiderid:sid}).toArray(function(err,models){
                    mongoPool.release(db);

                    var rval = groupAndSort(models,true,function(data){
                        var total = 0;
                        for(var mi in data){
                            if(data[mi].reviewNum){
                                total += parseInt(data[mi].reviewNum);
                            }
                        }
                        return total;
                    },function(item){
                        return batteryTag(item);
                    },function(item,title){
                        var amount = 0;
                        for(var mi in item){
                            if(item[mi].reviewNum){
                                amount += parseInt(item[mi].reviewNum)
                            }
                        }

                        return {
                            batteryrange:title,
                            count:amount
                        };
                    },null,true);
                    callback(err,rval);
                })
            });
        }
    });
};

Admin.getbatterybyavgpriceForModel = function(sid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("model",function(err,collection){
                collection.find({spiderid:sid}).toArray(function(err,models){
                    mongoPool.release(db);

                    var rval = groupAndSort(models,false,null,function(item){
                        return batteryTag(item);
                    },function(item,title){
                        var amount = 0;
                        var count = 0;
                        for(var mi in item){
                            if(item[mi].price){
                                amount += parseInt(item[mi].price);
                                count += 1;
                            }
                        }

                        return {
                            batteryrange:title,
                            count:amount/count
                        };
                    },null,true);
                    callback(err,rval);
                })
            });
        }
    });
};

function groupAndSort(data,iftotal,totalfunc,groupcallback,grouptoarray,sortcallback,ifslice){
    var total = 0;
    if(iftotal){
        total = totalfunc(data)
    }

    var groupOut = _.groupBy(data,function(item){
        return groupcallback(item);
    });
    var nextArray = [];
    for(var title in groupOut){
        var tmp = grouptoarray(groupOut[title],title);
        nextArray.push(tmp)
    }
    var result = _.sortBy(nextArray,function(item){
        if(sortcallback){
            return sortcallback(item);
        }
        else{
            return (-1)*item.count;
        }

    })
    if(ifslice){
        result = result.slice(0,10);
    }

    var returval = {
        models:result
    }
    if(iftotal){
        returval.total = total;
    }
    return returval;
}

Admin.publishSurvey = function(orgid,surveyid,stafflist,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("surveys",function(err,collection){
                collection.find({_id:ObjectID(surveyid)}).limit(1).next(function(err,survey){
                    if(survey){
                        if(survey.orgid != orgid){
                            callback(err,"forbidden");
                            mongoPool.release(db);
                        }
                        else{
                            collection.updateOne({_id:ObjectID(surveyid)},
                                {$set:{status:dict.SURVEYSTATUS_NORMAL,publishtime:new Date()}},
                                function(err,upres){

                                    db.collection("admins",function(err,admincollection){
                                        async.each(stafflist,function(staffid,cb){
                                            admincollection.find({_id:ObjectID(staffid)}).limit(1).next(function(err,staff){
                                                if(staff){
                                                    if(!staff.surveyList){
                                                        staff.surveyList = []
                                                    }
                                                    var ifExist = false;
                                                    for(var i in staff.surveyList){
                                                        if(staff.surveyList[i].surveyid == surveyid){
                                                            ifExist = true;
                                                            break;
                                                        }
                                                    }
                                                    if(!ifExist){
                                                        staff.surveyList.push({
                                                            surveyid:surveyid,
                                                            name:survey.name
                                                        });
                                                    }

                                                    admincollection.updateOne({_id:ObjectID(staffid)},
                                                        {$set:{surveyList:staff.surveyList}},
                                                        function(err,ures){
                                                            cb();
                                                        });
                                                }
                                                else{
                                                    cb();
                                                }
                                            });
                                        },function(err){
                                            mongoPool.release(db);
                                            callback(err,"ok");
                                        })
                                    })
                                });
                        }

                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"notfound")
                    }
                })
            });
        }
    });
};




Admin.assignSurvey = function(orgid,surveyid,staffid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("surveys",function(err,collection){
                collection.find({_id:ObjectID(surveyid)}).limit(1).next(function(err,survey){
                    if(survey){
                        if(survey.orgid != orgid){
                            callback(err,"forbidden");
                            mongoPool.release(db);
                        }
                        else{
                            db.collection("admins",function(err,staffcollection){
                                staffcollection.find({_id:ObjectID(staffid)}).limit(1)
                                    .next(function(err,staff){
                                        if(staff){
                                            if(staff.orgid != orgid){
                                                console.log("++++++++++");
                                                callback(err,"forbidden");
                                                mongoPool.release(db);
                                            }
                                            else if(survey.status!=dict.SURVEYSTATUS_NORMAL){
                                                console.log("---------------");
                                                callback(err,"forbidden");
                                                mongoPool.release(db);
                                            }

                                            else{
                                                if(!staff.surveyList){
                                                    staff.surveyList = []
                                                }
                                                var ifExist = false;
                                                for(var i in staff.surveyList){
                                                    if(staff.surveyList[i].surveyid == surveyid){
                                                        ifExist = true;
                                                        break;
                                                    }
                                                }
                                                if(!ifExist){
                                                    staff.surveyList.push({
                                                        surveyid:surveyid,
                                                        name:survey.name
                                                    });
                                                }

                                                staffcollection.updateOne({_id:ObjectID(staffid)},
                                                    {$set:{surveyList:staff.surveyList}},
                                                    function(err,ures){
                                                        callback(err,ures);
                                                        mongoPool.release(db);
                                                    });
                                            }
                                        }
                                        else{
                                            mongoPool.release(db);
                                            callback(err,"notfound")
                                        }
                                    });
                            });

                        }

                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"notfound")
                    }
                })
            });
        }
    });
};

Admin.removeAssginRepeat = function(callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("admins",function(err,collection){
                collection.find().toArray(function(err,admins){
                    async.each(admins,function(admin,cb){
                        var slist = [];
                        for(var sindex in admin.surveyList){
                            var survey = admin.surveyList[sindex];
                            var fvalue = slist.find(function(v,i,a){
                                return (v.surveyid == survey.surveyid);
                            })
                            if(!fvalue){
                                slist.push(survey)
                            }
                        }
                        collection.updateOne({_id:admin._id},
                            {$set:{surveyList:slist}},
                            function(err,ures){
                                cb();
                            });
                    },function(err){
                        mongoPool.release(db);
                        callback(err,"ok");
                    });


                });
            });
        }
    });
};

Admin.addVersion = function(orgid,platform,versionnum,fileurl,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("versions",function(err,collection){
                var newversion = {
                    orgid:orgid,
                    platform:platform,
                    versionnum:versionnum,
                    fileurl:fileurl,
                    ctime:new Date()
                };
                collection.insertOne(newversion,function(err,insert){
                    mongoPool.release(db);
                    callback(err,insert.insertedId);
                });
            });
        }
    });
};

Admin.addSadminVersion = function(platform,versionnum,fileurl,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("versions",function(err,collection){
                var newversion = {
                    platform:platform,
                    versionnum:versionnum,
                    fileurl:fileurl,
                    ctime:new Date()
                };
                collection.insertOne(newversion,function(err,insert){
                    mongoPool.release(db);
                    callback(err,insert.insertedId);
                });
            });
        }
    });
};

Admin.getSadminVersionList = function(callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("versions",function(err,collection){
                collection.find().sort({ctime:-1})
                    .toArray(function(err,ads){
                        mongoPool.release(db);
                        callback(err,ads);
                    })
            });
        }
    });
};

Admin.editSadminVersion = function(versionid,platform,versionnum,fileurl,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("versions",function(err,collection){

                collection.find({_id:ObjectID(versionid)}).limit(1).next(function(err,version){
                    if(version){
                        collection.updateOne({_id:ObjectID(versionid)},
                            {$set:{platform:platform,versionnum:versionnum,fileurl:fileurl}},function(err,msg){
                                mongoPool.release(db);
                                callback(err,"ok");
                            });
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"notfound");
                    }
                })
            });
        }
    });
};

Admin.deleteSadminVersion = function(versionid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("versions",function(err,collection){

                collection.find({_id:ObjectID(versionid)}).limit(1).next(function(err,ad){
                    if(ad){
                        collection.deleteOne({_id:ObjectID(versionid)},function(err,msg){
                            mongoPool.release(db);
                            callback(err,"ok");
                        });
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"notfound");
                    }
                })
            });
        }
    });
};


Admin.addAd = function(orgid,title,image,link,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("ads",function(err,collection){
                var newad = {
                    orgid:orgid,
                    title:title,
                    image:image,
                    link:link,
                    ctime:new Date()
                };
                collection.insertOne(newad,function(err,insert){
                    mongoPool.release(db);
                    callback(err,insert.insertedId);
                });
            });
        }
    });
};

Admin.getSurveyAnswerList = function(surveyid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("answers",function(err,collection){
                collection.find({surveyid:surveyid}).sort({ctime:-1}).toArray(function(err,sus){
                    async.each(sus,function(item,cb){
                        if(item.investigatorid){
                            db.collection("admins",function(err,admincollection){
                                admincollection.find({_id:ObjectID(item.investigatorid)})
                                    .limit(1).next(function(err,admin){
                                    if(admin){
                                        item.investigatorname = admin.name;
                                    }
                                    else{
                                        item.investigatorname = "";
                                    }

                                    cb();
                                })
                            });
                        }
                        else{
                            item.investigatorname = "";
                            cb()
                        }
                    },function(err){
                        mongoPool.release(db);
                        callback(err,sus);
                    });

                });
            });
        }
    });
};

Admin.getSadminAdList = function(callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("ads",function(err,collection){
                collection.find().sort({ctime:-1})
                    .toArray(function(err,ads){
                        mongoPool.release(db);
                        callback(err,ads);
                    })
            });
        }
    });
};

Admin.addSadminAd = function(title,image,link,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("ads",function(err,collection){
                var newad = {
                    title:title,
                    image:image,
                    link:link,
                    ctime:new Date()
                };
                collection.insertOne(newad,function(err,insert){
                    mongoPool.release(db);
                    callback(err,insert.insertedId);
                });
            });
        }
    });
};

Admin.editSadminAd = function(adid,title,image,link,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("ads",function(err,collection){

                collection.find({_id:ObjectID(adid)}).limit(1).next(function(err,ad){
                    if(ad){
                        collection.updateOne({_id:ObjectID(adid)},
                            {$set:{title:title,image:image,link:link}},function(err,msg){
                                mongoPool.release(db);
                                callback(err,"ok");
                            });
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"notfound");
                    }
                })
            });
        }
    });
};

Admin.deleteSadminAd = function(adid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("ads",function(err,collection){

                collection.find({_id:ObjectID(adid)}).limit(1).next(function(err,ad){
                    if(ad){
                        collection.deleteOne({_id:ObjectID(adid)},function(err,msg){
                            mongoPool.release(db);
                            callback(err,"ok");
                        });
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"notfound");
                    }
                })
            });
        }
    });
};

Admin.generateVerifiedCode = function(email,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("emailverified",function(err,collection){
                var randStr = randomstring.generate(6);

                collection.find({email:email}).limit(1).next(function(err,vericode){
                    if(vericode){
                        collection.updateOne({email:email},{$set:{code:randStr}},function(err,msg){
                            mongoPool.release(db);
                            callback(err,randStr);
                        })
                    }
                    else{
                        var ndb = {
                            email:email,
                            code:randStr
                        };
                        collection.insertOne(ndb,function(err,insert){
                            mongoPool.release(db);
                            callback(err,randStr);
                        });
                    }
                })
            });
        }
    });
};

Admin.checkVerifiedCode = function(email,verifiedcode,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("emailverified",function(err,collection){
                collection.find({email:email,code:verifiedcode}).limit(1).next(function(err,vericode){
                    if(vericode){
                        mongoPool.release(db);
                        callback(err,true);
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,false);
                    }
                })
            });
        }
    });
};

Admin.deleteVerifiedCode = function(email,verifiedcode,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("emailverified",function(err,collection){
                collection.deleteOne({email:email,code:verifiedcode},function(err,msg){
                    mongoPool.release(db);
                    callback(err,msg);
                })
            });
        }
    });
};

Admin.lookupFacebookId = function(fbid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("admins",function(err,adcollection){
                adcollection.find({fbid:fbid}).limit(1).next(function(err,admin){
                    if(admin){
                        mongoPool.release(db);
                        callback(err,admin);
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"notfound");
                    }
                });
            });

        }
    });
};

Admin.deleteAnswer = function(answerid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("answers",function(err,collection){
                collection.find({_id:ObjectID(answerid)}).limit(1).next(function(err,answer){
                    if(answer){
                        collection.deleteOne({_id:ObjectID(answerid)},function(err,msg){
                            mongoPool.release(db);
                            callback(err,msg);
                        })
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"notfound");
                    }
                })
            });
        }
    });
};

Admin.getFlipkartData = function(callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("brand",function(err,collection){
                //var bdataMap = {};
                collection.find({},{_id:0}).toArray(function(err,brands){
                    for(var i in brands){
                        var cb = brands[i];
                        //bdataMap[cb.brand] = cb;
                        //bdataMap[cb.brand].modelList = [];
                        cb.modelList = [];

                    }
                    db.collection("link",function(err,linkcollection){
                        async.each(brands,function(brand,secondcallback){
                            linkcollection.find({brand:brand.brand}).toArray(function(err,links){
                                db.collection("flipkartData",function(err,flibcollection){
                                    async.each(links,function(link,cb2){
                                        if(link.dataPid){
                                            flibcollection.find({dataPid:link.dataPid},{_id:0,dataPid:0,reviewHref:0}).limit(1).next(function(err,model){
                                                if(model){
                                                    //bdataMap[brand.brand].modelList.push(model);
                                                    //brand.modelList.push(model);
                                                    var minfo = {
                                                        reviewNum:model.reviewNum?model.reviewNum:0,
                                                        rate:model.rate?model.rate:0,
                                                        name:model.name?model.name:0
                                                    };
                                                    var aprice = 0;
                                                    var pnum = 0;
                                                    if(model.priceInfo){
                                                        var ptotal = 0;
                                                        for(var pindex in model.priceInfo){
                                                            ptotal+=parseFloat(model.priceInfo[pindex].price);
                                                            pnum+=1;
                                                        }
                                                        if(pnum>0){
                                                            aprice = parseInt(ptotal/pnum);
                                                        }

                                                    }
                                                    minfo.aprice = aprice;
                                                    var arate = 0;
                                                    var trate = (model.rate5?model.rate5:0)*5+
                                                        (model.rate4?model.rate4:0)*4+
                                                        (model.rate3?model.rate3:0)*3+
                                                        (model.rate2?model.rate2:0)*2+
                                                        (model.rate1?model.rate1:0)*1;
                                                    if(model.rate>0){
                                                        arate = parseInt(trate/model.rate)
                                                    }
                                                    minfo.arate = arate;
                                                    brand.modelList.push(minfo);

                                                }
                                                cb2();
                                            });
                                        }
                                        else{
                                            cb2();
                                        }
                                    },function(err){
                                        secondcallback();
                                    });
                                });
                            })
                        },function(err){
                            mongoPool.release(db);
                            callback(err,brands);
                        });
                    });
                });
            });
        }
    });
};

Admin.getCpacha = function(cid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("capcha",function(err,collection){
                var newCap = ccap();
                var ary = newCap.get();
                console.log("generate code is "+ary[0])
                if(cid){
                    collection.find({_id:ObjectID(cid)}).limit(1).next(function(err,capcha){
                        if(capcha){
                            collection.updateOne({_id:ObjectID(cid)},{$set:{value:ary[0]}},function(err,msg){
                                mongoPool.release(db);
                                callback(err,cid,ary[1]);
                            })


                        }else{
                            collection.insertOne({value:ary[0]},function(err,newc){
                                mongoPool.release(db);
                                callback(err,newc.insertedId.toString(),ary[1])
                            })
                        }

                    })
                }
                else{
                    collection.insertOne({value:ary[0]},function(err,newc){
                        mongoPool.release(db);
                        callback(err,newc.insertedId.toString(),ary[1])
                    })
                }


            });
        }
    });
};

Admin.checkCapcha = function(code,cid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("capcha",function(err,collection){
                console.log("id is "+cid)
                collection.find({_id:ObjectID(cid),value:code.toUpperCase()}).limit(1).next(function(err,capcha){
                    if(capcha){
                        mongoPool.release(db);
                        callback(err,capcha);

                    }else{
                        mongoPool.release(db);
                        callback(err,"notfound");
                    }

                })



            });
        }
    });
};
