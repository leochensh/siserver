var mongoPool = require("../db");
var Staff = {};
var dict = require("../dict");
var async = require("async")
var _ = require("underscore");
var ObjectID=require('mongodb').ObjectID;

module.exports = Staff;

Staff.login = function(uname,pass,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("admins",function(err,collection){

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
            db.collection("admins",function(err,collection){

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

var getEditorListName = function(surveylist,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("admins",function(err,collection){
                async.map(surveylist,function(surv,cb){
                    console.log(surv)
                    collection.find({_id:ObjectID(surv.editorid)}).limit(1).next(function(err,admin){
                        if(admin){
                            surv.editorname = admin.name;
                            cb(null,surv);
                        }
                        else{
                            cb("notfound",null);
                        }
                    })
                },function(err,survs){
                    mongoPool.release(db);
                    callback(survs);
                })
            });
        }
    });
};

Staff.getEditorSurveyList = function(editorid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("surveys",function(err,collection){

                collection.find({editorid:editorid,type:dict.TYPE_SURVEY},{orgid:0,questionlist:0})
                    .sort({ctime:-1}).toArray(function(err,surveys){
                        mongoPool.release(db);
                        getEditorListName(surveys,function(newsurveys){
                            callback(err,newsurveys);
                        })

                    });
            });
        }
    });
};

Staff.getAdminSurveyList = function(orgid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("surveys",function(err,collection){

                collection.find({orgid:orgid,type:dict.TYPE_SURVEY},{orgid:0,questionlist:0})
                    .sort({ctime:-1}).toArray(function(err,surveys){
                    mongoPool.release(db);
                    console.log("get e name");
                    getEditorListName(surveys,function(newsurveys){
                        callback(err,newsurveys);
                    });
                });
            });
        }
    });
};

Staff.getSAdminSurveyList = function(callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("surveys",function(err,collection){

                collection.find({type:dict.TYPE_SURVEY},{orgid:0,questionlist:0})
                    .sort({ctime:-1}).toArray(function(err,surveys){
                    mongoPool.release(db);
                    getEditorListName(surveys,function(newsurveys){
                        callback(err,newsurveys);
                    });
                });
            });
        }
    });
};

Staff.getTemplateList = function(callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("surveys",function(err,collection){

                collection.find({type:dict.TYPE_TEMPLATE},{orgid:0,questionlist:0})
                    .sort({ctime:-1}).toArray(function(err,surveys){
                    mongoPool.release(db);
                    callback(err,surveys);
                });
            });
        }
    });
};


Staff.editSurvey = function(name,surveyid,metainfo,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("surveys",function(err,collection){
                collection.find({_id:ObjectID(surveyid)}).limit(1).next(function(err,survey){
                    if(!survey){
                        mongoPool.release(db);
                        callback(err,"notfound");
                    }
                    else{
                        if(metainfo){
                            collection.updateOne({_id:ObjectID(surveyid)},
                                {$set:{
                                    name:name,
                                    metainfolist:JSON.parse(metainfo)}},function(err,result){
                                mongoPool.release(db);
                                callback(err,result);
                            });
                        }
                        else{
                            collection.updateOne({_id:ObjectID(surveyid)},
                                {$set:{
                                    name:name}},function(err,result){
                                    mongoPool.release(db);
                                    callback(err,result);
                                });
                        }

                    }
                });

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

Staff.editQuestion = function(orgid,questiondata,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("surveys",function(err,surveycollection){

                surveycollection.find({_id:ObjectID(questiondata.surveyid)}).limit(1).next(function(err,survey){
                    if(survey){
                        if(false){
                            mongoPool.release(db);
                            callback(err,"forbidden");

                        }
                        else{
                            db.collection("questions",function(err,questioncollection){
                                questioncollection.find({_id:ObjectID(questiondata.questionid)}).limit(1).next(function(err,question){
                                    if(question){
                                        questioncollection.updateOne({_id:ObjectID(questiondata.questionid)},
                                            {$set:questiondata},

                                            function(err,insertresult){
                                                console.log(err);
                                                mongoPool.release(db);
                                                callback(err,insertresult);
                                            });
                                    }
                                    else{
                                        console.log("not find question"+questiondata.questionid);
                                        mongoPool.release(db);
                                        callback(err,"notfound")
                                    }
                                });


                            });
                        }

                    }
                    else{
                        console.log("not find survey"+questiondata.surveyid);
                        mongoPool.release(db);
                        callback(err,"notfound")
                    }
                })

            });
        }
    });
};

Staff.changeQuestionSequence = function(sid,qid,direction,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("surveys",function(err,surveycollection){

                surveycollection.find({_id:ObjectID(sid)}).limit(1).next(function(err,survey){
                    if(survey){
                        var qlist = survey.questionlist;
                        console.log(qlist);
                        var findex = _.findIndex(qlist,function(item){
                            return qid==item.toString()
                        })
                        if(findex>=0){
                            if(direction == "up" && findex!=0){
                                var temp = qlist[findex-1];
                                qlist[findex-1] = qlist[findex];
                                qlist[findex] = temp;
                            }
                            else if(direction == "down" && findex != qlist.length-1){
                                var temp = qlist[findex+1];
                                qlist[findex+1] = qlist[findex];
                                qlist[findex] = temp;
                            }
                            surveycollection.updateOne({_id:ObjectID(sid)},
                                {$set:{"questionlist":qlist}},function(err,upes){
                                    mongoPool.release(db);
                                    callback(err,upes);
                                });
                        }
                        else{
                            console.log("sequence not found" + sid +","+qid)
                            callback(err,survey);
                        }
                    }
                    else{
                        console.log("not find survey"+sid);
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

Staff.deleteSurvey = function(surveyid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("surveys",function(err,collection){
                collection.find({_id:ObjectID(surveyid)}).limit(1).next(function(err,survey){
                    if(survey){
                        db.collection("admins",function(err,admincollection){
                            admincollection.find({"surveyList.surveyid":surveyid})
                                .toArray(function(err,arr){
                                    async.forEach(arr,function(sur,cb){
                                        var slist= sur.surveyList;
                                        var el = [];
                                        for(var i in slist){
                                            if(slist[i].surveyid!=surveyid){
                                                el.push(slist[i]);
                                            }
                                        }
                                        admincollection.updateOne({_id:sur._id},{$set:{surveyList:el}},function(err,ur){
                                            cb();
                                        });
                                    },function(err){
                                        console.log(err);
                                        collection.deleteOne({_id:ObjectID(surveyid)},function(err,dr){
                                            mongoPool.release(db);
                                            callback(err,dr);
                                        });
                                    });
                                });
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


Staff.getStaffSurveyList = function(staffid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("surveys",function(err,scollection){
                scollection.find({"$or":[{
                    status:dict.SURVEYSTATUS_NORMAL,
                    publishstatus:dict.SURVEYPUBLISHSTATUS_PRIVATEPERSONAL,
                    editorid:staffid,
                    type:dict.TYPE_SURVEY

                },{
                    status:dict.SURVEYSTATUS_NORMAL,
                    publishstatus:dict.SURVEYPUBLISHSTATUS_PUBLICPERSONAL,
                    type:dict.TYPE_SURVEY
                }]},{
                    orgid:0,questionlist:0,editorid:0
                }).sort({ctime:-1}).toArray(function(err,surveys){
                    for(var i in surveys){
                        surveys[i].surveyid = surveys[i]._id;
                    }
                    mongoPool.release(db);
                    callback(err,surveys);
                });
            });


            //db.collection("admins",function(err,collection){
            //    collection.find({_id:ObjectID(staffid)}).limit(1).next(function(err,staff){
            //        if(staff){
            //
            //            var returnList = [];
            //            if(staff.surveyList){
            //                returnList = staff.surveyList;
            //                async.each(returnList,function(item,cb){
            //                    db.collection("surveys",function(err,surveycollection){
            //                        surveycollection.find({_id:ObjectID(item.surveyid)}).limit(1).next(function(err,survey){
            //                            if(survey){
            //                                item.status = survey.status;
            //                                item.publishtime = survey.publishtime?survey.publishtime:""
            //                            }
            //                            cb();
            //                        })
            //                    });
            //                },function(err){
            //                    mongoPool.release(db);
            //                    callback(err,returnList);
            //                });
            //            }
            //            else{
            //                mongoPool.release(db);
            //                callback(err,returnList);
            //            }
            //
            //        }
            //        else{
            //            mongoPool.release(db);
            //            callback(err,"notfound")
            //        }
            //    })
            //});
        }
    });
};

Staff.getSurveyDetail = function(surveyid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("surveys",function(err,surveycollection){
                surveycollection.find({_id:ObjectID(surveyid)},{name:1,questionlist:1,status:1,metainfolist:1})
                    .limit(1).next(function(err,survey){
                        if(survey){
                            var qList = [];
                            var qDetailList = [];
                            if(survey.questionlist){
                                qList = survey.questionlist;

                            }
                            db.collection("questions",function(err,questioncollection){
                                async.forEachOfSeries(qList,function(q,index,cb){
                                    questioncollection.find({_id:q},{surveyid:0,ctime:0}).limit(1).next(function(qerr,question){
                                        if(question){
                                            question.index = index;
                                            for(var si in question.selectlist){
                                                question.selectlist[si].index = si;
                                            }
                                            qDetailList.push(question);
                                        }
                                        cb()
                                    })
                                },function(err){
                                    survey.questionlist = qDetailList;
                                    mongoPool.release(db);
                                    callback(err,survey);
                                })
                            });

                        }
                        else{
                            mongoPool.release(db);
                            callback(err,"notfound")
                        }
                    }
                );


            });
        }
    });
};

Staff.getSurveyFullDetail = function(surveyid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("surveys",function(err,surveycollection){
                surveycollection.find({_id:ObjectID(surveyid)})
                    .limit(1).next(function(err,survey){
                        if(survey){
                            var qList = [];
                            var qDetailList = [];
                            if(survey.questionlist){
                                qList = survey.questionlist;

                            }
                            db.collection("questions",function(err,questioncollection){
                                async.forEachOfSeries(qList,function(q,index,cb){
                                    questioncollection.find({_id:q}).limit(1).next(function(qerr,question){
                                        if(question){
                                            question.index = index;
                                            for(var si in question.selectlist){
                                                question.selectlist[si].index = si;
                                            }
                                            qDetailList.push(question);
                                        }
                                        cb()
                                    })
                                },function(err){
                                    survey.questionlist = qDetailList;
                                    mongoPool.release(db);
                                    callback(err,survey);
                                })
                            });

                        }
                        else{
                            mongoPool.release(db);
                            callback(err,"notfound")
                        }
                    }
                );


            });
        }
    });
};

Staff.saveAnswers = function(answerdata,staffid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{

            db.collection("answers",function(err,collection){
                collection.find({name:answerdata.name,
                    surveyid:answerdata.surveyid,
                    begintime:answerdata.begintime,
                    endtime:answerdata.endtime}).limit(1).next(function(err,ans){
                    if(ans){
                        mongoPool.release(db);
                        callback(err,"duplicate");
                    }
                    else{
                        answerdata.ctime = new Date();
                        if(staffid){
                            answerdata.investigatorid = staffid;
                        }

                        collection.insertOne(answerdata,function(err,res){
                            mongoPool.release(db);
                            callback(err,res.insertedId);
                        })
                    }
                });


            });
        }
    });
};

var processAnswers = function(answers,db,callback){
    async.each(answers,function(answer,cb){
        if(answer.surveyid){
            db.collection("surveys",function(error,surveycollection){
                surveycollection.find({_id:ObjectID(answer.surveyid)},{name:1})
                    .limit(1).next(function(err,survey){
                        if(survey){
                            answer.surveyname = survey.name;
                        }
                        cb();
                    })
            });
        }
        else{
            cb();
        }

    },function(err){
        mongoPool.release(db);
        callback(err,answers);
    });
};

Staff.getAnswerList = function(pagesize,pagenum,staffid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("answers",function(err,collection){
                if(pagesize == 0){
                    collection.find({investigatorid:staffid},{_id:1,surveyid:1,ctime:1})
                        .toArray(function(err,answers){
                            processAnswers(answers,db,callback)
                        });
                }
                else{
                    collection.find({investigatorid:staffid},{_id:1,surveyid:1,ctime:1})
                        .skip(pagenum*pagesize).limit(pagesize).toArray(function(err,answers){
                            processAnswers(answers,db,callback)
                        });
                }

            });
        }
    });
};

Staff.getAnswerDetail = function(answerid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("answers",function(err,collection){
                collection.find({_id:ObjectID(answerid)})
                    .limit(1).next(function(err,answer){

                        if(answer){
                            if(answer.investigatorid){
                                db.collection("admins",function(err,admincollection){
                                    admincollection.find({_id:ObjectID(answer.investigatorid)})
                                        .limit(1).next(function(err,admin){
                                            if(admin){
                                                answer.investigatorname = admin.name;
                                            }

                                            mongoPool.release(db);
                                            callback(err,answer);
                                        })
                                });
                            }
                            else{
                                mongoPool.release(db);
                                callback(err,answer);
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

Staff.addFeedback = function(feeddata,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("feedbacks",function(err,collection){
                feeddata.ctime = new Date();
                collection.insertOne(feeddata,function(err,insresult){
                    mongoPool.release(db);
                    callback(err,insresult.insertedId);
                });
            });
        }
    });
};

Staff.getVersionInfo = function(platform,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("versions",function(err,collection){
                collection.find({platform:platform},{_id:0,orgid:0}).sort({ctime:-1})
                    .limit(1).next(function(err,ver){
                        mongoPool.release(db);
                        callback(err,ver);
                    })
            });
        }
    });
};

Staff.getAdInfo = function(orgid,callback){
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

Staff.generateTemplatefromSurvey = function(surveyid,templatename,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("surveys",function(err,collection){
                collection.find({_id:ObjectID(surveyid),type:dict.TYPE_SURVEY},
                    {_id:0,name:0,editorid:0,type:0,status:0,ctime:0,publishstatus:0,publishtime:0}).limit(1).next(function(err,sur){
                    if(sur){
                        collection.insertOne({
                            name:templatename
                        },function(err,insresult){
                            var tempid = insresult.insertedId;
                            async.map(sur.questionlist,function(qu,cb){
                                Staff.cloneQuestion(qu,tempid,function(err,nqid){
                                    if(nqid!="notfound"){
                                        cb(null,nqid);
                                    }
                                    else{
                                        cb("notfound",null);
                                    }

                                });
                            },function(err,arrays){

                                if(err){
                                    mongoPool.release(db);
                                    console.log("BIG PROBLEM");
                                    callback(err,"notfound");
                                }
                                else{
                                    collection.updateOne({_id:tempid},{$set:{
                                        ctime:new Date(),
                                        type:dict.TYPE_TEMPLATE,
                                        questionlist:arrays,
                                        fromsurveyid:surveyid
                                    }},function(err,msg){
                                        console.log("completed survey to template");
                                        mongoPool.release(db);
                                        callback(err,tempid);
                                    })
                                }
                            })
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

Staff.cloneQuestionListFromTemplate = function(surveyid,templateid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("surveys",function(err,collection){
                collection.find({_id:ObjectID(templateid)}).limit(1).next(function(err,template){
                    if(template){
                        async.map(template.questionlist,function(qu,cb){
                            Staff.cloneQuestion(qu,surveyid,function(err,nqid){
                                if(nqid!="notfound"){
                                    cb(null,nqid);
                                }
                                else{
                                    cb("notfound",null);
                                }

                            });
                        },function(err,arrays){

                            if(err){
                                mongoPool.release(db);
                                console.log("BIG PROBLEM");
                                callback(err,"notfound");
                            }
                            else{
                                collection.updateOne({_id:surveyid},{$set:{
                                    questionlist:arrays
                                }},function(err,msg){
                                    console.log("completed template to survey");
                                    mongoPool.release(db);
                                    callback(err,msg);
                                })
                            }
                        })
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

Staff.cloneQuestion = function(qid,tempid,callback){
    mongoPool.acquire(function(err,db){
        if(err){

        }
        else{
            db.collection("questions",function(err,collection){
                collection.find({_id:qid},{_id:0,surveyid:0,ctime:0}).limit(1).next(function(err,oq){
                    if(oq){
                        console.log("clone question "+qid.toString());
                        oq.surveyid = tempid;
                        oq.ctime = new Date();
                        collection.insertOne(oq,function(err,insresult){
                            var nqid = insresult.insertedId;
                            mongoPool.release(db);
                            callback(err,nqid);
                        });
                    }
                    else{
                        mongoPool.release(db);
                        callback(err,"notfound");
                    }
                })
                mongoPool.release(db);
            });
        }
    });
}