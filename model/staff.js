var mongoPool = require("../db");
var Staff = {};
var dict = require("../dict");

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

Staff.createSurvey = function(orgid,uid,name,type,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("surveys",function(err,collection){
                var newsurvey = {
                    name:name,
                    orgid:orgid,
                    editorid:uid,
                    type:type,
                    status:dict.SURVEYSTATUS_EDIT,
                    ctime:new Date()
                };
                collection.insertOne(newsurvey,function(err,result){
                    mongoPool.release(db);
                    callback(err,result.insertedId);
                })
            });
        }
    });
};

Staff.createQuestion = function(orgid,questiondata,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("surveys",function(err,surveycollection){

                surveycollection.find({_id:ObjectID(questiondata.surveyid)}).limit(1).next(function(err,survey){
                    if(survey){
                        if(survey.orgid != orgid){
                            callback(err,"forbidden");
                            mongoPool.release(db);
                        }
                        else{
                            db.collection("questions",function(err,questioncollection){
                                questiondata.ctime = new Date();
                                questioncollection.insertOne(questiondata,function(err,insertresult){
                                    if(!survey.questionlist){
                                        survey.questionlist = [];
                                    }
                                    survey.questionlist.push(insertresult.insertedId);

                                    surveycollection.updateOne({_id:ObjectID(questiondata.surveyid)},
                                        {$set:{questionlist:survey.questionlist}},function(err,uresult){
                                            mongoPool.release(db);
                                            callback(err,insertresult.insertedId);
                                        });
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

Staff.deleteQuestion = function(orgid,questionid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("questions",function(err,questioncollection){

                questioncollection.find({_id:ObjectID(questionid)}).limit(1).next(function(err,question){
                    if(question){
                        db.collection("surveys",function(err,surveycollection){

                            surveycollection.find({_id:ObjectID(question.surveyid)}).limit(1).next(function(err,survey){
                                if(survey){

                                    var qListInSurvey = survey.questionlist;
                                    console.log(qListInSurvey)
                                    for(var index in qListInSurvey){
                                        if(qListInSurvey[index].toString() == question._id.toString()){
                                            qListInSurvey.splice(index,1)
                                        }
                                    }
                                    surveycollection.updateOne({_id:ObjectID(question.surveyid)},
                                        {$set:{"questionlist":qListInSurvey}},function(err,upes){
                                            questioncollection.deleteOne({_id:ObjectID(questionid)},function(err,dres){
                                                questioncollection.updateMany({"precedentid":questionid},
                                                    {$set:{"precedentid":null,"ifhasprecedent":false}},function(err,umres){
                                                        mongoPool.release(db);
                                                        callback(err,dres);
                                                    });

                                            });
                                        });
                                }
                                else{
                                    mongoPool.release(db);
                                    callback(err,"notfound");
                                }
                            })
                        })

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

Staff.proposeSurvey = function(orgid,surveyid,callback){
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
                                {$set:{status:dict.SURVEYSTATUS_PROPOSE}},function(err,upres){
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

Staff.getStaffSurveyList = function(staffid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("staffs",function(err,collection){
                collection.find({_id:ObjectID(staffid)}).limit(1).next(function(err,staff){
                    if(staff){

                        var returnList = [];
                        if(staff.surveyList){
                            returnList = staff.surveyList;
                        }
                        mongoPool.release(db);
                        callback(err,returnList);
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