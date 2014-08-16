// require all the files in this directory
require("fs").readdirSync(__dirname+"/").forEach(function(file) {
	if( (file.match(/.+\.js/g) !== null) && (file !== "index.js") ){
		var name = file.replace(".js","");
		exports[name] = require("./"+file);
	}
});

var utils = require("../../lib/utils");
var conf  = require("../../config/appconfig");
var vent  = require("../../lib/vent");
var neo   = require("../../lib/neo4j");

function Database(){
	var self = this;
	vent.on("db.validate.client_secret", function(){ self.validateClientSecret.apply(self, arguments); });
};

Database.prototype.validateClientSecret = function(){
	var req  = arguments[0],
		res  = arguments[1],
		evt  = arguments[2],
		cs   = req.body.client_secret;

	// query the neo db for a campaign....
	neo.query("match (c) where c.type='campaign' and c.client_secret={client_secret} return c",{
		client_secret : cs
	}, function(err, nodes){
		if( !err || !nodes || (nodes.length < 1) ){
			// no campaign... return...
			vent.emit("error.client_secret.no_campaign_match", res);
		}
		else{
			// success! fire the event we were passed as the success event
			// pass along the request the result and the campaign node
			vent.emit(evt, req, res, nodes.shift());
		}
	});
};

module.exports.db = new Database;