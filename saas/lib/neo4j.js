var conf = require("../config/appconfig");
module.exports = new require("neo4j").GraphDatabase(conf.db.host+":"+conf.db.port);