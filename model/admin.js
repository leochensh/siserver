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
                            adcollection.find({name:name}).limit(1).next(function(err,admin){
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
                        if(role!="sadmin" && survey.editorid != uid){
                            callback(err,"forbidden");
                            mongoPool.release(db);
                        }
                        else{
                            collection.updateOne({_id:ObjectID(surveyid)},
                                {$set:{status:dict.SURVEYSTATUS_NORMAL,
                                    publishstatus:dict.SURVEYPUBLISHSTATUS_PRIVATEPERSONAL,
                                    publishtime:new Date()}},function(err,upres){
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

Admin.publishSurveyToAll = function(surveyid,uid,role,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("surveys",function(err,collection){
                collection.find({_id:ObjectID(surveyid)}).limit(1).next(function(err,survey){
                    if(survey){
                        if((role!="sadmin" && survey.editorid != uid) || survey.status!=dict.SURVEYSTATUS_EDIT){
                            callback(err,"forbidden");
                            mongoPool.release(db);
                        }
                        else{
                            collection.updateOne({_id:ObjectID(surveyid)},
                                {$set:{status:dict.SURVEYSTATUS_PROPOSE,
                                    publishstatus:dict.SURVEYPUBLISHSTATUS_PUBLICPERSONAL,
                                    publishtime:new Date()}},function(err,upres){
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
                        if(survey.status!=dict.SURVEYSTATUS_PROPOSE || survey.publishstatus != dict.SURVEYPUBLISHSTATUS_PUBLICPERSONAL){
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
