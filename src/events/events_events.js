/**
 * @namespace
 * Event system that can be added to objects using pc.extend.
 * 
 * @example
 * var o = {};
 * o = pc.extend(o, pc.events);
 * 
 * // attach event
 * o.on("event_name", function() {
 *   alert('event_name fired');
 * }, this);
 * 
 * // fire event
 * o.fire("event_name");
 *
 * // detach all events from object
 * o.off('event_name');
 */
pc.events = function () {
    
    var Events = {
        /**
         * @function
         * @name pc.events.on
         * @description Attach an event handler to an event
         * @param {String} name Name of the event to bind the callback to
         * @param {Function} callback Function that is called when event is fired
         * @param {Object} [scope] Object to use as 'this' when the event is fired, defaults to current this
         * @example
         * var i = 
         */
        on: function (name, callback, scope) {
            if(pc.type(name) != "string") {
                throw new TypeError("Event name must be a string");
            }
            var callbacks = this._callbacks || (this._callbacks = {});
            var events = callbacks[name] || (callbacks[name] = []);
            events.push({
                callback: callback,
                scope: scope || this
            });
            
            return this;
        },
        
        /**
         * @name pc.events.off
         * @description Detach an event handler from an event. If callback is not provided then all callbacks are unbound from the event, 
         * if scope is not provided then all events with the callback will be unbound.
         * @param {String} name Name of the event to unbind
         * @param {Function} [callback] Function to be unbound
         * @param {Object} [scope] Scope that was used as the this when the event is fired
         */
        off: function (name, callback, scope) {
            var callbacks = this._callbacks;
            var events;
            var index;

            if (!callbacks) {
                return; // no callbacks at all
            }

            if(!callback) {
                // Clear all callbacks
                callbacks[name] = [];
            } else {
                events = callbacks[name]
                if (!events) {
                    return this;
                }
                
                for(index = 0; index < events.length; index++) {
                    if(events[index].callback === callback) {
                        if (!scope || (scope === events[index].scope)) {
                            events.splice(index, 1);
                            index--;
                        }
                    }
                }
            }
            
            return this;
        },

        /**
         * Fire an event, all additional arguments are passed on to the event listener
         * @param {Object} name Name of event to fire
         */
        fire: function (name) {
            var index;
            var length;
            var args = pc.makeArray(arguments);
            var callbacks;
            args.shift();
            
            if(this._callbacks && this._callbacks[name]) {
                callbacks = this._callbacks[name].slice(); // clone list so that deleting inside callbacks works
                length = callbacks.length;
                for(index = 0; index < length; ++index) {
                    var scope = callbacks[index].scope;
                    callbacks[index].callback.apply(scope, args);
                }            
            }
            
            return this;
        }
    };

    // For compatibility
    Events.bind = Events.on;
    Events.unbind = Events.off;

    return Events;
} ();
