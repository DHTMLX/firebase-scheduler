(function(){

	function init(scheduler){

		var events;
		var unsubscr;

		function init_saving(data){
			events = [
				scheduler.attachEvent("onEventChanged", function(eventId, event) {
					if (scheduler._update_from_firebase) return;

					save_start(eventId);
					data.doc(eventId).update(toFirebaseData(event))
						.then(save_end)
						.catch(error_handler);
				}),
				scheduler.attachEvent("onEventDeleted", function(eventId, event) {
					if (scheduler._update_from_firebase) return;

					// ignore call against temporary IDs
					if (typeof eventId !== "string") return;
					save_start(eventId);
					data.doc(eventId).delete()
						.then(save_end)
						.catch(error_handler);
				}),
				scheduler.attachEvent("onEventAdded", function(eventId, event) {
					if (scheduler._update_from_firebase) return;

					save_start(eventId);
					data.add(toFirebaseData(event))
						.then(a => {
							scheduler.changeEventId(eventId, a.id);
							return a;
						})
						.then(save_end)
						.catch(error_handler);
				})
			];
		}

		function init_loading(data){
			unsubscr = data.onSnapshot(function(query) {
				if (query.metadata.hasPendingWrites) return;

				scheduler._update_from_firebase = true;
				var queue = [];

				try {
					query.docChanges().forEach(function(change) {
						var id = change.doc.id;
						var data = fromFirebaseData(change.doc);

						switch(change.type){
							case "added":
								if (!scheduler.getEvent(id))
									queue.push(data); //collecting data batch
								break;

							case "modified":
								var ev = scheduler.getEvent(id);
								for (var key in data)
									ev[key] = data[key];
								scheduler.updateEvent(id);
								break;

							case "removed":
								scheduler.deleteEvent(id);
								break;
						}
					});

					//batch adding
					if (queue.length){
						scheduler.parse(queue, "json");
					}
				} catch(e){
					console.error(e);
				}

				scheduler._update_from_firebase = false;
			});
		}

		function toFirebaseData(event){
			var res = {};
			for (var key in event){
				if (key !== "id" && key[0] !== "_"){
					res[key] = event[key];
				}
			}

			return res;
		}

		function fromFirebaseData(event){
			var data = event.data();
			var obj = { id:event.id };
			for (var key in data){
				var test = data[key];
				if (typeof test === "object" && test && test.seconds){
					obj[key] = new Date(test.seconds*1000);
				} else {
					obj[key] = test;
				}
			}

			return obj;
		}

		function error_handler(err){
			scheduler.callEvent("onFirebaseError", err);
		}

		function save_end(){
			scheduler.callEvent("onFirebaseSaveEnd", data);
		}
		function save_start(eventId){
			scheduler.callEvent("onFirebaseSaveStart", eventId);
		}

		scheduler.firebase = function(data){
			// unsubscribe previous collection
			scheduler.clearAll();
			scheduler.firebaseStop();

			init_loading(data);
			init_saving(data);
		};

		scheduler.firebaseStop = function(){
			// detach scheduler's events
			if (events)
				for (var i=0; i<events.length; i++)
					scheduler.detachEvent(events[i]);

			// detach firebase events
			if (unsubscr)
				unsubscr();

			events = unsubscr = null;
		}
	  
	}

	if (window.scheduler)
		init(scheduler);
	if (window.Scheduler && Scheduler.plugin)
		Scheduler.plugin(init);

})();