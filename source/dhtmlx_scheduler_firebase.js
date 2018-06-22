(function(){
	function init(scheduler){

		// client and firebase events
		var fevents = [];
		var events = [];

		// data loading
		var queue = [];
		var parse_wait;

		var mode = 0;
		function guard(code){
			if (mode !== 0) return;
			mode = 1;
			code();
			mode = 0;
		}

		function init_saving(data){
		events = [
			scheduler.attachEvent("onEventAdded", function(eventId, event) {
			 	guard(function(){
					save_start(eventId);
					var id = data.push(toFirebaseData(event), function(err) {
						if(err)
							error_handler(err);
						else {
							scheduler.changeEventId(eventId, id);
							save_end(id);
						}
					}).key;
				});
			}),
			scheduler.attachEvent("onEventDeleted", function(eventId, event) {
				guard(function(){
					save_start(eventId);
					data.child(eventId).set(null, function(err) {
						if(err)
							error_handler(err);
						else
							save_end(eventId);
					});
				});
			}),
			scheduler.attachEvent("onEventChanged", function(eventId, event) {
				guard(function(){
					save_start(eventId);
					data.child(eventId).update(toFirebaseData(event), function(err) {
						if(err)
							error_handler(err);
						else
							save_end(eventId);
					});
				});
			})
		]
		}

		function parse_loading(){
			scheduler.parse(queue, "json");
			queue = [];
			parse_wait = null;
		}
		function init_loading(data){
			fevents = [
				data.on("child_added", function(pack) {
					guard(function(){
						var obj = fromFirebaseData(pack);
						if (!scheduler.getEvent(obj.id)){
						queue.push(obj);

						if (parse_wait)
							clearTimeout(parse_wait);
						parse_wait = setTimeout(parse_loading, 1);
						}
					});
				}),
				data.on("child_changed", function(pack) {
					guard(function(){
						var obj = fromFirebaseData(pack);
						var ev = scheduler.getEvent(obj.id);
						if (ev){
							for(var key in obj)
								ev[key] = obj[key];
							scheduler.updateEvent(obj.id);
						}
					});
				}),
				data.on("child_removed", function(pack) {
					guard(function(){
						var obj = fromFirebaseData(pack);
						var ev = scheduler.getEvent(obj.id);
						if (ev)
							scheduler.deleteEvent(obj.id);
					});
				})
			];
		}

		function toFirebaseData(event){
			var res = {};
			for (var key in event){
				if (key === "start_date" || key === "end_date"){
					res[key] = Math.round(event[key].valueOf()/1000);
				} else if (key !== "id" && key[0] !== "_"){
					res[key] = event[key];
				}
			}

			return res;
		}

		function fromFirebaseData(event){
			var data = event.val();
			var obj = { id:event.key };
			for (var key in data){
				var test = data[key];
				if (key === "start_date" || key === "end_date"){
				obj[key] = new Date(test*1000);
				} else {
				obj[key] = test;
				}
			}

			return obj;
		}

		function error_handler(err){
			scheduler.callEvent("onFirebaseError", err);
		}

		function save_end(eventId){
			scheduler.callEvent("onFirebaseSaveEnd", eventId);
		}

		function save_start(eventId){
			scheduler.callEvent("onFirebaseSaveStart", eventId);
		}

		scheduler.firebase = function(data){
			// unsubscribe previous collection
			scheduler.clearAll();
			scheduler.firebaseStop();

			scheduler._last_firebase_ref = data;
			init_loading(data);
			init_saving(data);
		};

		scheduler.firebaseStop = function(data){
			// detach scheduler's events
			for (var i=0; i<events.length; i++)
				scheduler.detachEvent(events[i]);

			data = data || scheduler._last_firebase_ref;
			if (fevents.length){
				data.off("child_added", fevents[0]);
				data.off("child_changed", fevents[1]);
				data.off("child_removed", fevents[2]);
			}

			events = fevents = [];
		}

	}

if (window.scheduler)
	init(scheduler);
if (window.Scheduler && Scheduler.plugin)
	Scheduler.plugin(init);

})();