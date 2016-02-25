var acl = require('acl');
var mongoPool = require("../db");

var aclFunction = {};

module.exports = aclFunction;
var aclHandler = null;
mongoPool.acquire(function(err, db){
    aclHandler = new acl(new acl.mongodbBackend(db, "acl"));
    aclHandler.allow('admin','changeadminpass','post');
});

exports.aclHandler = aclHandler;

