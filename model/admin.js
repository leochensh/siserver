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
                            disable:false
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
    console.log(uname)
    console.log(pass)
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("admins",function(err,collection){
                console.log(uname)
                console.log(pass)
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

Admin.createOrgAdmin = function(orgid,name,pass,callback){
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
                                        disable:false
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
                        db.collection("staffs",function(err,adcollection){
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
            db.collection("staffs",function(err,collection){

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
            db.collection("staffs",function(err,collection){

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
                            db.collection("staffs",function(err,staffcollection){
                                staffcollection.find({_id:ObjectID(staffid)}).limit(1)
                                    .next(function(err,staff){
                                        if(staff){
                                            if(staff.orgid != orgid){
                                                console.log("++++++++++")
                                                callback(err,"forbidden");
                                                mongoPool.release(db);
                                            }
                                            else if(survey.status!=dict.SURVEYSTATUS_NORMAL){
                                                console.log("---------------")
                                                callback(err,"forbidden");
                                                mongoPool.release(db);
                                            }
                                            else if(staff.role!=dict.STAFF_INVESTIGATOR){
                                                console.log("!!!!!!!!!!!!!!!!")
                                                callback(err,"forbidden");
                                                mongoPool.release(db);
                                            }
                                            else{
                                                if(!staff.surveyList){
                                                    staff.surveyList = []
                                                }
                                                staff.surveyList.push({
                                                    surveyid:surveyid,
                                                    name:survey.name
                                                });
                                                staffcollection.updateOne({_id:ObjectID(staffid)},
                                                    {$set:{surveyList:staff.surveyList}},
                                                    function(err,ures){
                                                        callback(err,ures);
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