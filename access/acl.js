var acl = require('acl');
var mongoPool = require("../db");
var dict = require("../dict")

var mycallback=[];
var aclFunction = {
    registerWait:function(callback){
        mycallback.push(callback);
    }
};

module.exports = aclFunction;
var aclHandler = null;
mongoPool.acquire(function(err, db){
    aclHandler = new acl(new acl.mongodbBackend(db, "acl"));

    aclHandler.allow([
        {
            roles:['sadmin'],
            allows:[
                {resources:'/testacl', permissions:'get'},
                {resources:'/edata', permissions:'get'},
                {resources:"/sadmin",permissions:["post","put","delete","get"]}
            ]
        },
        {
            roles:['admin',dict.STAFF_PERSONAL,dict.STAFF_ORG,'sadmin'],
            allows:[
                {resources:'/admin/pass/change', permissions:'put'},
                {resources:'/admin/staff/add',permissions:'post'},
                {resources:'/admin/staff/resetpass',permissions:'put'},
                {resources:'/admin/staff/delete',permissions:'delete'},
                {resources:'/admin/survey',permissions:['put','get','delete','post']},
                {resources:'/admin/version',permissions:['post']},
                {resources:'/admin/ad',permissions:['post']},
                {resources:'/admin/exportxlsx',permissions:['post']},
                {resources:'/admin/staff',permissions:["get","post","put","delete"]}
            ]
        },
        {
            roles:['admin',dict.STAFF_ORG,dict.STAFF_EDITOR,dict.STAFF_INVESTIGATOR,dict.STAFF_PERSONAL,'sadmin'],
            allows:[
                {resources:'/staff/pass/change',permissions:'put'},
                {resources:'/staff/upload',permissions:"post"}
            ]
        },
        {
            roles:['admin',dict.STAFF_EDITOR,dict.STAFF_PERSONAL,dict.STAFF_ORG,'sadmin'],
            allows:[
                {resources:'/editor/survey',permissions:['post','delete','put','get']}
            ]
        },
        {
            roles:['admin',dict.STAFF_INVESTIGATOR,dict.STAFF_PERSONAL,dict.STAFF_ORG],
            allows:[
                {resources:'/investigator/survey',permissions:['get','post']},
                {resources:'/investigator/feedback',permissions:['post']},
                {resources:'/investigator/version',permissions:['get']},
                {resources:'/investigator/ad',permissions:['get']}
            ]
        }
    ]);
    aclHandler.addUserRoles('superadmin', 'sadmin');
    for(var item in mycallback){
        mycallback[item](aclHandler);
    }

});

aclFunction.acl = aclHandler;



