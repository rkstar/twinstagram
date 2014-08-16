module.exports = {
	letters : ['a','b','c','d','e','f','g','h','i','j','k','l','m',
			  'n','o','p','q','r','s','t','u','v','w','x','y','z'],
	numbers : [0,1,2,3,4,5,6,7,8,9],
	lettersAndNumbers : function(){ return letters.concat(numbers); },

	// return a random string of characters...
	// utils.random( length, type )
	//
	// types:
	// alphanumeric,
	// both,
	// alpha,
	// letters,
	// numeric,
	// numbers
	random : function(){
		var len  = arguments[0] || 8,
			type = arguments[1] || "alphanumeric",
			output = "",
			characters,
			i;
		switch( type ){
			case "alpha":
			case "letters":
				characters = this.letters;
			break;

			case "numeric":
			case "numbers":
				characters = this.numbers;
			break;

			case "alphanumeric":
			case "both":
			default:
				characters = this.lettersAndNumbers();
			break;
		}
		for( i=0; i<len; i++ ){
			output += characters[this.randomBetween(0,characters.length)];
		}
		return output;
	},

	randomBetween : function( min, max ){
		return Math.floor(Math.random() * (max-min+1) + min);
	},

	// taken directly from underscore.js -- modified to check for empty values
	defaults : function( obj ){
		each(slice.call(arguments, 1), function(src){
			if( src ){
				for( var prop in src ){
					if( (obj[prop] === undefined) || (obj[prop] === "") ){
						obj[prop] = src[prop];
					}
				}
			}
		});
		return obj;
	}
};