var acl = require('acl');
var mongoPool = require("../db");

var mycallback=null;
var aclFunction = {
    registerWait:function(callback){
        mycallback = callback;
    }
};

module.exports = aclFunction;
var aclHandler = null;
mongoPool.acquire(function(err, db){
    aclHandler = new acl(new acl.mongodbBackend(db, "acl"));

    aclHandler.allow('superadmin','/testacl','get');

    aclHandler.addUserRoles('superadmin', 'superadmin');
    if(mycallback){
        mycallback(aclHandler);
    }

});

aclFunction.acl = aclHandler;



