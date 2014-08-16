"use strict";

var conf  = require("../../config/appconfig");
var vent  = require("../../lib/vent");
var neo   = require("../../lib/neo4j");
var utils = require("../../lib/utils");

function User(){
	var self = this;
	var defaults : {
		type : "user",
		service_type : "instagram",
		full_name : "Mr. Default",
		username : "misterdefault"
	};

	vent.on("user.create", function(){ self.create.apply(self, this.event, arguments); });
	vent.on("user.read", function(){ self.read.apply(self, arguments); });
	vent.on("user.update", function(){ self.update.apply(self, arguments); });
	vent.on("user.delete", function(){ self._delete.apply(self, arguments); });
	vent.on("campaign.created", function(){ self.create.apply(self, this.event, arguments); });
};

User.prototype.create = function(){
	var e    = arguments[0],
		req=null, res, campaign={}, user;
	if( e === "campaign.created" ){
		res = arguments[1];
		campaign = arguments[2];
		user = utils.defaults(arguments[3], this.defaults);
	}
	else{
		req = arguments[1];
		res = arguments[2];
	}

	// create the user node
	neo.createNode(user).save(function(err, nodes){
		if( err ){
			vent.emit("error.user.create", res);
		}
		else{

		}
		(err)
			? vent.emit("error.user.create", res)
			: vent.emit("success.user.create", res);
	});
};

User.prototype.read = function(){
	var req  = arguments[0],
		res  = arguments[1],
		data = req.body,
		self = this;
};

User.prototype.update = function(){
	var req  = arguments[0],
		res  = arguments[1],
		data = req.body,
		self = this;
};

User.prototype._delete = function(){
	var req  = arguments[0],
		res  = arguments[1],
		data = req.body,
		self = this;
}
module.exports = new User;