"use strict";

var vent = require("../../lib/vent");
var conf = require("../../config/appconfig");
var clients   = require("../../config/clients");
var instagram = require("instagram-node-lib");
var twitter   = require("node-twitter-api");

// requires an instance of the EventEmitter passed in
function Application(){

    // poll interval : 15 seconds
    this.poll_interval = 15 * 1000;
    // this will hold the intervals
    this.intervals = {};
    // store the last poll time so we know which items to deal
    // with when they come back from the polling
    this.last_interval_time = 0;

	// init the application
	//  ... this is our constructor
	// check subscriptions
	// https://api.instagram.com/v1/subscriptions?client_secret=3ccad2eaa80343c98cff4ebc2147735f&client_id=165faeece6704fa0946e8333b593fc60

	var self = this;
	// subscribe to events
	vent.on("instagram:handshake", function(){ self.handshake.apply(self, arguments); });
	vent.on("instagram:stream_notification", function(){ self.instagramStreamNotification.apply(self, arguments); });
	vent.on("instagram:media_notification", function(){ self.instagramMediaNotification.apply(self, arguments); });

	// instagram api setup
	instagram.set("client_id", conf.services.instagram.id);
	instagram.set("client_secret", conf.services.instagram.secret);
	instagram.set("callback_url", conf.url+":"+conf.port+conf.services.instagram.callback_url);
	// instagram.set("redirect_uri", conf.url+":"+conf.port+conf.services.instagram.redirect_uri);
	// instagram.set("maxSockets", 10);

	// make sure we unsubscribe from all tags before we start subscribing to more...
	// instagram.tags.unsubscribe_all();

	// loop through the client data and set up our subscriptions
	clients.forEach(function(data){
//
// NOTE:
// the instagram real-time api is garbage. it will kill subscriptions, but it looks to
// be flakey (at best) when posting back to my URLs. since i have to poll to keep the
// subscription alive anyway, i may as well just poll.
//
		// use the instagram-node-lib to subscribe to the real-time api to look for
		// our specific hashtag
//		instagram.tags.subscribe({
//			object : "tag",
//			object_id : data.hashtag,
//			aspect : "media",
//			type : "subscription",
//			// callback_url : conf.url+conf.services.instagram.callback_url,
//			id : "#"
//		});
        
        // start polling...
        self.intervals[data.hashtag] = setInterval(
            function(){
                vent.emit(
                    "instagram:stream_notification",
                    { body : [
                        { object_id : data.hashtag } ] }
                );
            },
            self.poll_interval
        );
	});
};

//
// NOTE:
// don't need this BS because the instagram realtime api is garbage
// (see above)
//
//
// Application.prototype.handshake = function(){
// 	var req = arguments[0],
// 		res = arguments[1],
// 		handshake = instagram.subscriptions.handshake(req,res);
// };

Application.prototype.instagramStreamNotification = function(){
	var req  = arguments[0],
		res  = arguments[1],
		data = req.body,
		self = this;
    // we have to keep a log of which tags we're going to poll for...
    data.forEach(function(tag){
        self.instagramMediaCallout(tag.object_id);
    });
};

Application.prototype.instagramMediaNotification = function(){
	var data = arguments[0],
		self = this;
	// grab the media data
	data.forEach(function( media ){
		if( media.created_time >= self.last_interval_time ){
			vent.emit("media.add", media, "instagram");
		}
	});
    this.last_interval_time = Math.floor((new Date().getTime() - this.poll_interval) / 1000);
};

Application.prototype.instagramMediaCallout = function( tag ){    
    // poll instagram!
    var self = this;
    instagram.tags.recent({
        name : tag,
        complete : function(){
            self.instagramMediaNotification.apply(self, arguments);
        }
    });
};

Application.prototype.twitterMediaCallout = function( tag ){
    // poll twitter!
    var self = this;
};

module.exports = new Application;