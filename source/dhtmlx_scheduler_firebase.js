(function() {

    var gEventsCollection = null,
        gFirebaseListenersCollection = null,
        gDataSnapshot = null;

    scheduler.firebase = function(dataSnapshot) {

        gDataSnapshot = dataSnapshot;
        gEventsCollection = new DataCollection();
        gFirebaseListenersCollection = new DataCollection();

        var self = this,
            dataSnapshotHandlerObj = new DataSnapshotHandler(dataSnapshot);

        gFirebaseListenersCollection.add(dataSnapshot.on("child_added", function(dataSnapshot) {
            var eventData = serializeEventData(dataSnapshot.val(), true),
                event = self.getEvent(eventData.id);

            if(!event)
                self.addEvent(eventData);
        }));

        gFirebaseListenersCollection.add(dataSnapshot.on("child_changed", function(dataSnapshot) {
            var eventData = serializeEventData(dataSnapshot.val(), true),
                event = self.getEvent(eventData.id);

            if(!event)
                return false;

            for(var key in eventData)
                event[key] = eventData[key];

            self.updateEvent(eventData.id);
            return true;
        }));

        gFirebaseListenersCollection.add(dataSnapshot.on("child_removed", function(dataSnapshot) {
            var eventData = dataSnapshot.val();
            if(self.getEvent(eventData.id))
                self.deleteEvent(eventData.id);
        }));

        gEventsCollection.add(this.attachEvent("onEventChanged", function(eventId, event) {
            dataSnapshotHandlerObj.save(event);
        }));

        gEventsCollection.add(this.attachEvent("onEventDeleted", function(eventId) {
            dataSnapshotHandlerObj.remove(eventId);
        }));

        gEventsCollection.add(this.attachEvent("onEventAdded", function(eventId, event) {
            dataSnapshotHandlerObj.save(event);
        }));

    };

    scheduler.firebaseStop = function() {
        var self = this;
        if(gEventsCollection) {
            gEventsCollection.each(function(eventId) {
                self.detachEvent(eventId);
            });
            gEventsCollection.clean();
        }

        if(gFirebaseListenersCollection) {
            var eventsTypes = ["child_added", "child_changed", "child_removed"];
            gFirebaseListenersCollection.each(function(listener) {
                for(var i = 0; i < eventsTypes.count; i++)
                    gDataSnapshot.off(eventsTypes[i], listener);
            });
            gFirebaseListenersCollection.clean();
        }
    };

    function DataSnapshotHandler(dataSnapshot) {

        this.save = function(event) {
            event = serializeEventData(event);
            this.findEvent(event.id, function(dataSnapshot) {
                if(dataSnapshot.exists())
                    dataSnapshot.ref().update(event);
                else
                    dataSnapshot.ref().push(event);
            });
        };

        this.remove = function(eventId) {
            this.findEvent(eventId, function(dataSnapshot) {
                if(dataSnapshot.exists())
                    dataSnapshot.ref().remove();
            });
        };

        this.findEvent = function(eventId, callback) {
            dataSnapshot.orderByChild("id").equalTo(eventId).once("value", function(eventSnapshot) {
                if(!eventSnapshot.exists())
                    callback.call(null, eventSnapshot);

                eventSnapshot.forEach(function(dataSnapshot) {
                    callback.call(null, dataSnapshot);
                });
            });
        };
    }

    function serializeEventData(event, unserilize) {
        var parsedData = {};
        for(var property in event) {
            if(property.charAt(0) == "_")
                continue;

            parsedData[property] = event[property].valueOf();

            if(property == "id")
                parsedData[property] = parsedData[property].toString();

            if(unserilize && (property == "start_date" || property == "end_date"))
                parsedData[property] = new Date(parsedData[property]);
        }

        return parsedData;
    }

    function DataCollection() {
        var collectionData = {},
            currentUid = new Date().valueOf();

        function _uid() {
            return currentUid++;
        }

        this.add = function(data) {
            var dataId = _uid();
            collectionData[dataId] = data;
            return dataId;
        };

        this.each = function(handler) {
            for(var key in collectionData)
                handler.call(this, collectionData[key]);
        };

        this.clean = function() {
            collectionData = {};
        };
    }

})();