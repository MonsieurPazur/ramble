onst Datastore = require('nedb')

class Ramble {
    constructor() {
        this.db = {}
        this.db.dialogs = new Datastore({
            filename: 'data/dialogs.db',
            autoload: true
        })
    }

    dialogs = {
        list: (callback) => {
            this.db.dialogs.find({}, function(err, docs) {
                return callback(docs)
            })
        },
        add: (doc, callback) => {
            this.db.dialogs.insert(doc, function(err, newDoc) {
                return callback(newDoc)
            })
        },
        update: (id, data, callback) => {
            this.db.dialogs.update({
                _id: id
            }, data, {
                returnUpdatedDocs: true
            }, function(err, numAffected, affectedDocuments) {
                return callback(affectedDocuments)
            })
        },
        remove: (id, callback) => {
            this.db.dialogs.remove({
                _id: id
            }, {}, function(err, numRemoved) {
                return callback(numRemoved)
            })
        }
    }
}

module.exports = Ramble
