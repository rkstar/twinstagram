"use strict";
//////////////
// twinstagr.am service application
//
// written by: david fudge [rkstar@mac.com]
// created on: march 5, 2014
//
//////////////

// these modules just respond to events...
require("./lib/log");
require("./lib/errors");

// start the server
var vent = require("./lib/vent");
	vent.on("server.started",function(port){
		log("Server", "server listening on port: "+port);
	});

var db  = require("./controllers/db");
var srv = require("./controllers/app/server");
var app = require("./controllers/app");