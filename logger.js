var mongoPool = require("./db");
var winston = require("winston");

require('winston-mongodb').MongoDB;

var logger = {};
mongoPool.acquire(function(err, db) {
    logger.logger = new (winston.Logger)({
        transports: [
            new (winston.transports.MongoDB)({
                db: db,
                collection: 'logs'
            }),
            new (winston.transports.Console)(),
        ]

    })
});

module.exports = logger;