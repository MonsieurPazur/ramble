const Datastore = require('nedb');

class Ramble {
	constructor() {
		this.db = {};
		this.db.dialogs = new Datastore({
			filename: 'data/dialogs.db',
			autoload: true
		});
		this.db.characters = new Datastore({
			filename: 'data/characters.db',
			autoload: true
		});
	}

	dialogs = {
		list: (callback) => {
			this.db.dialogs.find({}, function(err, docs) {
				return callback(docs);
			});
		},
		add: (doc) => {
			const db = this.db.dialogs;
			return new Promise(function(resolve) {
				db.insert(doc, function( err, newDoc) {
					resolve(newDoc);
				});
			});
		},
		update: (id, data, callback) => {
			this.db.dialogs.update({
				_id: id
			}, data, {
				returnUpdatedDocs: true
			}, function(err, numAffected, affectedDocuments) {
				return callback(affectedDocuments);
			});
		},
		remove: (id, callback) => {
			this.db.dialogs.remove({
				_id: id
			}, {}, function(err, numRemoved) {
				return callback(numRemoved);
			});
		}
	}

	characters = {
		list: () => {
			const db = this.db.characters;
			return new Promise(function(resolve) {
				db.find({}, function(err, docs) {
					resolve(docs);
				});
			});
		},
		get: (name) => {
			const db = this.db.characters;
			return new Promise(function(resolve) {
				db.findOne({name: name}, function(err, doc) {
					resolve(doc);
				});
			});
		},
		add: (doc) => {
			const db = this.db.characters;
			return new Promise(function(resolve) {
				db.insert(doc, function(err, newDoc) {
					resolve(newDoc);
				});
			});
		}
	}
}

module.exports = Ramble;
