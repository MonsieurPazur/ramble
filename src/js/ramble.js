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

  search(phrase) {
    return new Promise((resolve) => {
      const regexp = new RegExp(phrase);
      this.db.dialogs.find({
        $or: [
          { name: regexp },
          { text: regexp },
          { 'character.name': regexp },
        ],
      }, (err, docs) => {
        resolve(docs);
      });
    });
  }

  export() {
    // TODO
  }

dialogs = {
  flush: () => {
    this.db.dialogs.persistence.compactDatafile();
  },
  list: () => new Promise((resolve) => {
    this.db.dialogs.find({}, (err, docs) => {
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
      this.db.dialogs.update(
        { _id: id },
        data,
        options,
        (err, numAffected, affectedDocuments) => {
          this.dialogs.flush();
          resolve(affectedDocuments);
        },
      );
    });
  },
  unmarkStart: () => {
    const options = {
      returnUpdatedDocs: true,
    };
    return new Promise((resolve) => {
      this.db.dialogs.update(
        { start: true },
        { $set: { start: false } },
        options,
        (err, numAffected, affectedDocuments) => {
          this.dialogs.flush();
          resolve(affectedDocuments);
        },
      );
    });
  },
  remove: id => new Promise((resolve) => {
    this.db.dialogs.remove({ _id: id }, {}, (err, numRemoved) => {
      this.dialogs.flush();
      resolve(numRemoved);
    });
  }),
  markAsStart: id => new Promise((resolve) => {
    this.dialogs.unmarkStart()
      .then(this.dialogs.update(id, { $set: { start: true } }))
      .then((updatedDialog) => {
        resolve(updatedDialog);
      });
  }),
}

characters = {
  flush: () => {
    this.db.characters.persistence.compactDatafile();
  },
  list: () => new Promise((resolve) => {
    this.db.characters.find({}, (err, docs) => {
      resolve(docs);
    });
  }),
  get: name => new Promise((resolve) => {
    this.db.characters.findOne({ name }, (err, doc) => {
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
