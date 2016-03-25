var mongoPool = require("../db");
var dict = require("../dict")
var Admin = {};

var ObjectID=require('mongodb').ObjectID;

module.exports = Admin;

const crypto = require('crypto');



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
                    for(var index in admins){
                        var admin = admins[index];
                        var slist = []
                        for(var sindex in admin.surveyList){
                            var survey = admin.surveyList[sindex];
                            var fvalue = slist.find(function(v,i,a){
                                v.surveyid = survey.surveyid;
                            })
                            if(!fvalue){
                                slist.push(survey)
                            }
                        }
                        collection.updateOne({_id:admin._id},
                            {$set:{surveyList:slist}},
                            function(err,ures){
                                callback(err,ures);
                                mongoPool.release(db);
                            });
                    }
                    
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