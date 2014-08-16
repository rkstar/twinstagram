"use strict";

var conf  = require("../../config/appconfig");
var vent  = require("../../lib/vent");
var neo   = require("../../lib/neo4j");
var utils = require("../../lib/utils");

function Campaign(){
	var id = null;
	var self = this;
	var class_name = "Campaign";
	var defaults = {
		created : new Date,
		hashtag : "#twinstagram",
		media_default : "OK",	// options: OK, PENDING
		user_limit : 0,			// limit the number of participants (0 === no limit)
		campaign_id : utils.random(conf.db.token_length),
		client_id : utils.random(conf.db.token_length),
		client_secret : utils.random(conf.db.token_length)
	};

	vent.on("campaign.create", function(){ self.create.apply(self, arguments); });
	vent.on("campaign.read", function(){ self.read.apply(self, arguments); });
	vent.on("campaign.update", function(){ self.update.apply(self, arguments); });
	vent.on("campaign.delete", function(){ self._delete.apply(self, arguments); });
};

// create a new campaign from posted data
Campaign.prototype.create = function(){
	var req  = arguments[0],
		res  = arguments[1],
		self = this,
		data = req.body;
		// extra safety...
		data.campaign = data.campaign || {};
		data.campaign.created = data.campaign.campaign_id = undefined;
		data.campaign.client_id = data.campaign.client_secret = undefined;
		// now merge the required data into the opts to make sure
		// our data overrides any shinanigans that may have happened prior
	var opts = utils.defaults(data.campaign, this.defaults);

	// a little bit of sanity before we rush into a new campaign
	if( !data.user ){
		vent.emit("error.campaign.create.no_user", res);
		vent.emit("log.Campaign.create", "No user data found");
		return;
	}

	// do some simple error checking here...
	if( !opts.hashtag || (opts.hashtag.length < 2) || !(opts.hashtag instanceof String) ){
		vent.emit("error.campaign.create.no_hashtag", res);
		vent.emit("log.Campaign.create", "No hashtag defined.");
		return;
	}

	// we're good! create this campaign
	neo.createNode(opts).save(function(err, node){
		if( err ){
			vent.emit("error.campaign.create.no_save", res);
			vent.emit("log.Campaign.create", err);
		}
		else{
			vent.emit("campaign.created", res, node, data.user);
		}
	});
};

Campaign.prototype.read = function(){
	var req  = arguments[0],
		res  = arguments[1],
		campaign_id = arguments[2],
		self = this;

	// find and return the campaign data...
	neo.query("match (c) where c.type='campaign' and c.campaign_id={cid} limit 1",{
		cid : campaign_id
	}, function(err, nodes){
		if( err || !nodes || (nodes.length < 1) ){
			vent.emit("log.Campaign.read", "Could not find campaign: "+campaign_id);
			// send an empty json object back...
			res.json({});
		}
		else{
			// send back the campaign node
			res.json(nodes.shift());
		}
	});
};

Campaign.prototype.update = function(){
	var req  = arguments[0],
		res  = arguments[1],
		data = req.body,
		campaign_id = arguments[2],
		self = this;

	// update the campaign
};

Campaign.prototype._delete = function(){
	var req  = arguments[0],
		res  = arguments[1],
		campaign_id = arguments[2],
		self = this;

	// set the campaign status to "deleted"
};

module.exports = new Campaign;