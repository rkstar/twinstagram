"use strict";
// simply log a message to the console with a datestamp

var conf = require("../config/appconfig");
var vent = require("./vent");

function Log(){
	vent.on("log.*", function(){
		var msg = arguments[0].substr(4);
		console.log("["+new Date+"]("+this.event+") "+msg);
	});
};

module.exports = new Log;