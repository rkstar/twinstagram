// 'use strict';
// NOTE: cannot use strict mode!
// here's why:
//
// TypeError: 'caller', 'callee', and 'arguments' properties
// may not be accessed on strict mode functions or the arguments objects
// for calls to them

/////// 
// NOTE:
// now using EventEmitter2 -- https://github.com/asyncly/EventEmitter2
//

// a singleton event emitter instance...
var EventEmitter = require('eventemitter2').EventEmitter2,
    vent = function(){
        if ( arguments.callee._singletonInstance ){
            return arguments.callee._singletonInstance;
        }
        arguments.callee._singletonInstance = this;  
        EventEmitter.call(this);
    };
    vent.prototype.__proto__ = EventEmitter.prototype;

// returning the instantiated emitter will either give back
// the singleton instance if it exists, or will create a new one! woot.
module.exports = new vent({
	wildcard : true,
	delimiter : ".",
	newListener : true,
	maxListeners : 10
});