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
		list: () => {
			const db = this.db.dialogs;
			return new Promise(function (resolve) {
				db.find({}, function(err, docs) {
					resolve(docs);
				});
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
		update: (id, data) => {
			const db = this.db.dialogs;
			const options = {
				returnUpdatedDocs: true
			};
			return new Promise(function(resolve) {
				db.update({_id: id}, data, options, function(err, numAffected, affectedDocuments) {
					resolve(affectedDocuments);
				})
			});
		},
		remove: (id) => {
			const db = this.db.dialogs;
			return new Promise(function(resolve) {
				db.remove({_id: id}, {}, function(err, numRemoved) {
					resolve(numRemoved);
				})
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
