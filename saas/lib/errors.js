var vent = require("./vent");
var conf = require("../config/appconfig");
var i18n = require("../app/i18n");

function ErrorMessenger(){
	vent.on("error.*", function(){ self.respond.apply(self, this.event, arguments); });
	vent.on("success.*", function(){ self.respond.apply(self, this.event, arguments); });
};

ErrorMessenger.prototype.respond = function(){
	var e   = arguments[0],
		res = arguments[1];
	res.json({
		errorcode : (e.substr(0,3)==="err") ? -1 : 0,
		error : e,
		message : i18n[conf.lang][e]
	});
};

module.exports = new ErrorMessenger;