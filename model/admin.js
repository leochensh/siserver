var mongoPool = require("../db");
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
                        const hash = crypto.createHash('sha256');
                        hash.update(passhash);
                        var superadmin = {
                            name:"superadmin",
                            passhash:hash.digest('hex'),
                            ctime:new Date()
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