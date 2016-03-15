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
                {resources:"/sadmin",permissions:["post","put","delete"]}
            ]
        },
        {
            roles:['admin'],
            allows:[
                {resources:'/admin/pass/change', permissions:'put'},
                {resources:'/admin/staff/add',permissions:'post'},
                {resources:'/admin/staff/resetpass',permissions:'put'},
                {resources:'/admin/staff/delete',permissions:'delete'},
                {resources:'/admin/survey',permissions:['put']}
            ]
        },
        {
            roles:[dict.STAFF_EDITOR,dict.STAFF_INVESTIGATOR],
            allows:[
                {resources:'/staff/pass/change',permissions:'put'}
            ]
        },
        {
            roles:[dict.STAFF_EDITOR],
            allows:[
                {resources:'/editor/survey',permissions:['post','delete','put']}
            ]
        },
        {
            roles:[dict.STAFF_INVESTIGATOR],
            allows:[
                {resources:'/investigator/survey',permissions:['get']}
            ]
        }
    ]);
    aclHandler.addUserRoles('superadmin', 'sadmin');
    for(var item in mycallback){
        mycallback[item](aclHandler);
    }

});

aclFunction.acl = aclHandler;



