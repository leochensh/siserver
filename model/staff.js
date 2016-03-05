var mongoPool = require("../db");
var Staff = {};

var ObjectID=require('mongodb').ObjectID;

module.exports = Staff;

Staff.login = function(uname,pass,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("staffs",function(err,collection){

                collection.find({name:uname,passhash:pass}).limit(1).next(function(err,admin){
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

Staff.changeStaffPass = function(staffname,oldpass,newpass,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("staffs",function(err,collection){

                collection.find({name:staffname}).limit(1).next(function(err,admin){
                    if(admin){
                        if(admin.passhash != oldpass){
                            mongoPool.release(db);
                            callback(err,"errorpass");
                        }
                        else{
                            collection.updateOne({name:staffname},{$set:{passhash:newpass}},function(err,updatedata){
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