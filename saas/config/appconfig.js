module.exports = {
	url : "http://twinstagram.cirrusvps.com",
    port : process.env.PORT || 8080,
	services : {
		instagram : {
			id : "165faeece6704fa0946e8333b593fc60",
			secret : "3ccad2eaa80343c98cff4ebc2147735f",
			callback_url : "/instagram/stream"
		},
		twitter : {
			key : "sO7LJE1heZKQ37hPkbdw",
			secret : "irvyCnpk1IIXIcl5ZoXgN1i1hu116eq1THuLiK6ZOhw",
			callback_url : "/twitter/stream"
		}
	},

	lang : "en",

	allowed_domains : [
		"http://gimmespring.com"
	],

	db : {
		host : "http://localhost",
		port : 7070,
		relationship_labels : {
			user_to_campaign : ":ENTERED_IN",
			media_to_user : ":ADDED_BY",
			campaign_to_user : ":OWNED_BY"
		},
		token_length : 32
	},

    array_unique : function(a){
        return a.reduce(function(p,c){
            if( p.indexOf(c)<0){ p.push(c); }
            return p;
        }, []);
    }
};
///////////////////////////////////////////
//
// below is a list of the events that are emitted throughout
// this application, and their meaning
//
//
// (RTAPI) == "instagram real-time api"
// "instagram:handshake"				--> RTAPI handshake initiated
// "instagram:stream_notification"		--> RTAPI stream updated
// "instagram:media_notification"		--> RTAPI media data received
// "instagram:add_media"				--> media ready to be added to db
//
// "twitter:add_media"					--> media ready to be added to db