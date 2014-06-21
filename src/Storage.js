/*  STORAGEADAPTER V1.0

	# constructor @StorageAdapter (params)

	@param localStorageKey (string)
		- the key that is being used to point to data in LocalStorage
		- defaults to "storage"

	@param saveOnSet (bool)
		- flags if each set action shoud be saved immediately

*/
var StorageAdapter = function(settings) {
	var self = this;
	this.settings = settings ? settings : {
		localStorageKey: "storage",
		saveOnSet: false
	};
	this.data = {};
	this.events = {
		storageremove: new CustomEvent("storageremove"),
		storagesave: new CustomEvent("storagesave"),
		storageget: new CustomEvent("storageget"),
		storageset: new CustomEvent("storageset"),
		storageinit: new CustomEvent("storageinit"),
		storageemptied: new CustomEvent("storageemptied")
	}
	this.walks = {
		walkRemove: function(keyName) {
			var layers = keyName.split(".");
			var last = layers[layers.length-1];

			var current = self.data;

			for(var i = 0; i < layers.length-1; i++) {
				if(typeof current[layers[i]] === 'object') {
					current = current[layers[i]];
					if(layers[i] == layers[layers.length-2]) {
						delete current[last];
						break;
					}
				}
			}
		},
		walkGet: function(keyName) {
			var layers = keyName.split(".");
			var last = layers[layers.length-1];

			var current = self.data;

			for(var i = 0; i < layers.length-1; i++) {
				if(typeof current[layers[i]] === 'object') {
					current = current[layers[i]];
					if(layers[i] == layers[layers.length-2]) {
						return current[last];
						break;
					}
				}
			}
		},
		walkSet: function(keyName, value) {
			var layers = keyName.split(".");
			var last = layers[layers.length-1];

			var current = self.data;

			for(var i = 0; i < layers.length-1; i++) {
				if(typeof current[layers[i]] === 'object') {
					current = current[layers[i]];
					if(layers[i] == layers[layers.length-2]) {
						current[last] = value;
						break;
					}
				}
			}
		}
	}
	this.init();
}

/* 
	# @init (void)
	# initializes on instantiation
	# checks whether key already is created
	 	if so: initialize StorageAdapter with existing data (point of LocalStorage)
	# saves to localStorage so the current version of data is maintained
*/
StorageAdapter.prototype.init = function() {
	if(localStorage.getItem(this.settings.localStorageKey)) {
		this.data = JSON.parse(localStorage.getItem(this.settings.localStorageKey));
	} else {
		localStorage.setItem(this.settings.localStorageKey, "{}");
		this.data = JSON.parse(localStorage.getItem(this.settings.localStorageKey));
	}
	this.save();
	document.dispatchEvent(this.events.storageinit);
}

/* 
	# @save (void)
	# calls native LocalStorage and saves data property as stringified json
*/
StorageAdapter.prototype.save = function() {
	localStorage.setItem(this.settings.localStorageKey, JSON.stringify(this.data));
	document.dispatchEvent(this.events.storagesave);
}

/* 
	# @remove (key)
	# removes a key from the data object
	# saves to localstorage if param saveOnSet is true
*/
StorageAdapter.prototype.remove = function(key) {
	if(key.indexOf(".") > -1) {
		this.walks.walkRemove(key);
	} else {
		delete this.data[key];
	}
	if(this.settings.saveOnSet) {
		this.save();
	}
	document.dispatchEvent(this.events.storageremove, { detail: key });
}

/* 
	# @remove (key)
	# removes a key from the data object
	# saves to localstorage if param saveOnSet is true
	# can walk a layered object if specified as dot notation
*/
StorageAdapter.prototype.set = function(key, value) {
	if(key.indexOf(".") > -1) {
		this.walks.walkSet(key, value);
	} else {
		this.data[key] = value;
	}
	if(this.settings.saveOnSet) {
		this.save();
	}
	document.dispatchEvent(this.events.storageset, { detail: { key: key, value: value } });
	return value;
}

/* 
	# @get (key, asJSON)
	# returns a key from the data object
	# saves to localstorage if param saveOnSet is true
	# can walk a layered object if specified as dot notation
	# returns as stringified json when optional asJSON is set to true
*/
StorageAdapter.prototype.get = function(key, asJSON) {
	if(key.indexOf(".") > -1) {
		var value = this.walks.walkGet(key);
	} else {
		var value = this.data[key];
	}
	document.dispatchEvent(this.events.storageget, { detail: value });
	if(!asJSON) {
		return value;
	} else {
		return JSON.stringify(value);
	}
}

/* 
	# @empty (void)
	# drops complete data object, saving it as an empty object
*/
StorageAdapter.prototype.empty = function() {
	this.data = {};
	this.save();
	document.dispatchEvent(this.events.storageemptied, { detail: {} });
}

/* 
	# @getJSON (void)
	# returns data object as stringified JSON
*/
StorageAdapter.prototype.getJSON = function() {
	return JSON.stringify(this.data);
}