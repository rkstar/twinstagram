"use strict";

var vent = require("../../lib/vent");
var conf = require("../../config/appconfig");
// server stuff
var express = require("express");
var srv     = express();
var bodyParser     = require("body-parser");
var methodOverride = require("method-override");
var errorHandler   = require("errorhandler");
var io = require("socket.io");

function Server(){
	// ... this is our constructor
	srv.use(bodyParser());
	srv.use(methodOverride());
	srv.use(errorHandler());
	srv.use(function(req, res, next){
		res.set({
			"Access-Control-Allow-Origin" : conf.allowed_domains.join(","),
			"Access-Control-Allow-Methods" : "GET, POST, PUT, PATCH",
			"Access-Control-Allow-Headers" : "X-Requested-With,content-type",
			"Access-Control-Allow-Credentials" : true
		});
	    // Pass to next layer of middleware
	    next();
	});

	// set up server for listening
	io.listen(srv.listen(conf.port));
	vent.emit("server.started",conf.port);

	// set up instagram and twitter
	this.instagramSetup();
	// this.twitterSetup();

	// application setup
	this.applicationSetup();
};

// every route in this application will first check the validity of
// the client_secret being passed in,
//
// if the client_secret is valid, the validator function will emit
// the event passed along with the validation request
//
// vent.emit("db:validate_client_secret" req, res, <event to emit on success> );
//
// the client_secret must be passed in with each request
Server.prototype.applicationSetup = function(){

	srv.route("/media")
		// get all approved media for their campaign
		.get(function( req, res, next ){
			vent.emit("db.validate.client_secret", req, res, "media.read");
		})
		.post(function( req, res, next ){
			vent.emit("db.validate.client_secret", req, res, "media.create");
		}).
		put(function( req, res, next ){
			vent.emit("db.validate.client_secret", req, res, "media.update");
		});

	srv.route("/user")
		// get info about the user
		.get(function( req, res, next ){
			vent.emit("db.validate.client_secret", req, res, "user.read");
		})
		// create a new user
		.post(function( req, res, next ){
			vent.emit("db.validate.client_secret", req, res, "user.create");
		})
		.put(function( req, res, next ){
			vent.emit("db.validate.client_secret", req, res, "user.update");
		});

	// NOTE:
	// this function is different because (obvi) if we are creating a campaign
	// we do not yet have a client_id, client_secret, or campaign_id
	//
	// create a new campaign
	srv.route("/campaign")
		.get(function( req, res, next ){
			vent.emit("db.validate.client_secret", req, res, "campaign.read");
		})
		.post(function( req, res, next ){
			vent.emit("campaign.create", req, res);
		});
};

Server.prototype.instagramSetup = function(){
	// INSTAGRAM ------
	// this is needed to receive the stream handshake
	srv.route(conf.services.instagram.callback_url)
		.get(function( req, res, next ){
			vent.emit("instagram.handshake", req, res);
		})
		.post(function( req, res, next ){
			vent.emit("instagram.stream_notification", req, res);
		});
};

Server.prototype.twitterSetup = function(){
	// TWITTER ------
	// this is needed to receive the stream handshake
	srv.route(conf.services.twitter.callback_url)
		.get(function( req, res, next ){
			vent.emit("twitter.handshake", req, res);
		});
};

module.exports = new Server;