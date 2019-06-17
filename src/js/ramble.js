const Datastore = require('nedb');

class Ramble {
  constructor() {
    this.db = {};
    this.db.dialogs = new Datastore({
      filename: 'data/dialogs.db',
      autoload: true,
    });
    this.db.characters = new Datastore({
      filename: 'data/characters.db',
      autoload: true,
    });
    this.db.characters.ensureIndex({ fieldName: 'name', unique: true });
  }

dialogs = {
  flush: () => {
    this.db.dialogs.persistence.compactDatafile();
  },
  list: () => new Promise((resolve) => {
    this.db.dialogs.find({}, (err, docs) => {
      this.dialogs.flush();
      resolve(docs);
    });
  }),
  add: doc => new Promise((resolve) => {
    this.db.dialogs.insert(doc, (err, newDoc) => {
      this.dialogs.flush();
      resolve(newDoc);
    });
  }),
  update: (id, data) => {
    const options = {
      returnUpdatedDocs: true,
    };
    return new Promise((resolve) => {
      this.db.dialogs.update({ _id: id }, data, options, (err, numAffected, affectedDocuments) => {
        this.dialogs.flush();
        resolve(affectedDocuments);
      });
    });
  },
  remove: id => new Promise((resolve) => {
    this.db.dialogs.remove({ _id: id }, {}, (err, numRemoved) => {
      this.dialogs.flush();
      resolve(numRemoved);
    });
  }),
}

characters = {
  flush: () => {
    this.db.characters.persistence.compactDatafile();
  },
  list: () => new Promise((resolve) => {
    this.db.characters.find({}, (err, docs) => {
      this.characters.flush();
      resolve(docs);
    });
  }),
  get: name => new Promise((resolve) => {
    this.db.characters.findOne({ name }, (err, doc) => {
      this.characters.flush();
      resolve(doc);
    });
  }),
  add: doc => new Promise((resolve) => {
    this.db.characters.insert(doc, (err, newDoc) => {
      this.characters.flush();
      resolve(newDoc);
    });
  }),
}
}

module.exports = Ramble;
