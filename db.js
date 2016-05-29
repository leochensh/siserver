
var mongoClient = require('mongodb').MongoClient;
var poolModule = require('generic-pool');

var pool = poolModule.Pool({
    name     : 'mongodb',
    create   : function(callback) {
        mongoClient.connect('mongodb://localhost:27017/smartinsight', {
            server:{poolSize:1}
        }, function(err,db){
            callback(err,db);
        });
    },
    destroy  : function(db) { db.close(); },
    max      : 10,//根据应用的可能最高并发数设置
    idleTimeoutMillis : 30000,
    log : false
    //more code here
});


//module.exports = new mongoClient(new Server('localhost', 27017));
module.exports = pool;