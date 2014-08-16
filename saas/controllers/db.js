"use strict";

var vent  = require("../lib/vent");
var conf  = require("../config/appconfig");
var neo4j = require("neo4j");

// this file contains interactions for our database
function Database(){

    this.neo = new neo4j.GraphDatabase('http://localhost:7070');
	var self = this;

	vent.on("instagram:add_media", function(){ self.addInstagramMedia.apply(self, arguments); });
	vent.on("twitter:add_media", function(){ self.addTwtitterMedia.apply(self, arguments); });

	vent.on("media:create_relationship", function(){ self.linkMediaToUser.apply(self, arguments); });
	vent.on("media:get", function(){ self.getMedia.apply(self, arguments); });

	vent.on("user:create", function(){ self.addUser.apply(self, arguments); });
	vent.on("user:create_relationship", function(){ self.linkUserToCampaign.apply(self, arguments); });
};

Database.prototype.addUser = function(){
	var req  = arguments[0],
		res  = arguments[1],
		cmpaign_id = req.params.campaign_id,
		callback   = arguments[2],
		opts = JSON.parse(req.body),
		self = this;

	var node = this.neo.createNode(opts);
		node.save(function(n){
			// create the relationship to this campaign!


////////////////
// HOW ARE WE GOING TO KNOW THE CAMPAIGN_ID HERE IF WE HAVE JUST
// GOTTEN THIS DATA FROM INSTAGRAM ?
//
//
//
			// run the callback if defined...
			(callback) ? callback(n) : null;
		});
};

Database.prototype.addInstagramMedia = function(){
	var data = arguments[0];
		data.service_type = "instagram";
	this.addMedia(data);
};
Database.prototype.addTwtitterMedia = function(){
	var data = arguments[0];
		data.service_type = "twitter";
	this.addMedia(data);
};
Database.prototype.addMedia = function(){
	var data = arguments[0],
		self = this;
	// first, let's make sure this media doesn't already exist...
	this.neo.query("match (m) where m.type<>'user' and m.service_id={service_id} return m",{
		service_id : data.id
	},function(err, nodes){
		if( !nodes || (nodes.length < 1) ){
			var opts = {
				type : data.type,
				// implement this once we have a way of changing the status...
				// status : "PENDING",
				status : "OK",
				service_id : data.id,
				service_type : data.service_type,
			// node properties CANNOT be nested!
			// we need to stringify the original data set...
				service_data : JSON.stringify(data),
				tags : data.tags,
				image_url : data.images.standard_resolution.url,
				thumbnail_url : data.images.thumbnail.url,
				created_time : data.created_time
			};
			if( opts.type == "video" ){
				opts.video_url = data.videos.standard_resolution.url;
			}
			var media_node = self.neo.createNode(opts);
		    media_node.save(function(err, node){
		        if( !err ){
		        	// our media node has been created, now we'll search
		        	// for a user node and create a relationship, or create
		        	// a new user node and then create the relationship
		        	vent.emit("db:create_relationship", node, data);
		        }
		    });
		}
	});
};

Database.prototype.createRelationship = function(){
	var media_node = arguments[0],
		data = arguments[1],
		self = this;
	// first, we have to search for our user node...
	this.neo.query("match (n) where n.username={username} return n",{
	username : data.user.username
	}, function( err, nodes ){
		var user_node;
		if( !nodes || (nodes.length < 1) ){
			var opts = {
				type : "user",
				service_id : data.user.id,
				service_type : data.service_type,
				service_data : JSON.stringify(data.user),
				username : data.user.username,
				full_name : data.user.full_name,
				profile_picture : data.user.profile_picture
			};
			self.addUser({body:JSON.stringify(opts)}, {}, function( err, node ){
				if( !err ){
					// now that we've created a user node, we have to save it
					// and add the "added_by" relationship to the media we've been
					// provided.
					media_node.createRelationshipTo(node, ":ADDED_BY", {
						// no properties to add to this relationship...
					}, function( err, rel ){
						// (err)
						// ? console.log(err)
						// : console.log("relationship created.");
					});
				}
			});
		}
		else {
			user_node = nodes.shift().n;
			media_node.createRelationshipTo(user_node, ":ADDED_BY", {
				// no properties to add to this relationship...
			}, function( err, rel ){
				// (err)
				// ? console.log(err)
				// : console.log("relationship created.");
			});
		}
	});
};

// use this function to return data from our db
Database.prototype.getMedia = function(){
	var req    = arguments[0],
		res    = arguments[1],
		self   = this,
		list   = [],
		index  = {},
		campaign_id = req.params.campaign_id,
		q  = "match (campaign)<-[]-(user)<-[]-(media) where campaign.campaign_id={cid} and media.status='OK' ";
		q += "return user,media order by media.created_time desc";

	// get all of the user/media nodes associated to the requested campaign
	this.neo.query(q, {cid:campaign_id}, function(err, result){
		if( err || !result || (result.length < 1) ){
			console.log("["+new Date()+"] "+err);
		}
		else{
			// get all of our nodes and add them to the list
			var data, user, media;
			while( data = result.shift() ){
				user  = data.user.data;
				media = data.media.data;
				// add this media to our list
				media.service_data = JSON.parse(media.service_data);
				list.push(media);
			}
		}
		res.json(list);
	});
};

module.exports = new Database;