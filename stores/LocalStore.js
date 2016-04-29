'use strict';

import RemoteStore from 'stores/RemoteStore';
import Util from '../support/Util';

let objects = sessionStorage || localStorage || {};

let generateId = (prefix) => {
  let tentativeId = Date.now();
  while (objects[prefix + tentativeId.toString()] !== undefined) {
    // Hard to test this branch without spies/mocks
    tentativeId--;
  }
  return prefix + tentativeId.toString();
};

let stringify = JSON.stringify;
let parse = JSON.parse;

class LocalStore {
  static clear() {
    if (objects.clear) {
      objects.clear();
    } else {
      objects = {};
    }
  }

  static first() {
    let prefix = this.prefix;
    let keys = Object.keys(objects).filter((key) => {
      return ( key.indexOf(prefix) == 0 );
    });
    let firstObject = objects[keys[0]];
    if (firstObject) {
      return parse(firstObject);
    }
  }

  // Get object by id
  static get(id) {
    if (!id || typeof id === undefined) return null;
    let object = objects[id];
    if (object) {
      return parse(object);
    }
  }

  static find(localId) {
    return this.get(localId);
  }

  // Insert without id
  static insert(object, createPath) {
    let newID = generateId(this.prefix);
    object.localId = newID;
    objects[newID] = stringify(object); // Temporarily store new object

    return RemoteStore.createAsync(this, object, createPath).then(
      (remoteObject) => {
        // Delete locally cached object
        delete objects[newID];

        // Store inserted object with remote ID
        let key = this.idParam(remoteObject);
        objects[key] = stringify(remoteObject);

        return Promise.resolve(remoteObject);
      }
    );
  }

  // Merge object with the existing object
  static update(id, object) {
    let existingObject = this.get(id) || {};
    let updatedObject = Object.assign(existingObject, object);
    objects[id] = stringify(updatedObject);

    return RemoteStore.updateAsync(this, updatedObject);
  }

  static delete(idParam) {
    let object = this.get(idParam);
    return RemoteStore.deleteAsync(this, object.id)
      .then(() => {
        // Delete only after remote confirmation
        delete objects[idParam];

        return Promise.resolve();
      });
  }

  static all(filter) {
    if (filter === undefined) {
      filter = () => true;
    }
    let all = [];
    for (var key in objects) {
      if (key.indexOf(this.prefix) == 0) {
        let object = parse(objects[key]);
        if (filter(object)) {
          all.push(object);
        }
      }
    }

    if (this.sortBy) {
      all = Util.sortArray(all, this.sortBy);
    }

    return all;
  }

  static load(id) {
    var store = this.store;
    return RemoteStore.showAsync(this, id).then(
      (object) => {
        let key = this.idParam(object);
        store[key] = stringify(object);
        return Promise.resolve(object);
      },
      Promise.reject
    );
  }

  static loadCustom(path, options) {
    return RemoteStore.customAsync(this, path, options);
  }

  static loadAll(options) {
    options = options || {};
    let path = options.path;
    delete options['path'];

    var store = this.store;
    var sortBy = this.sortBy;
    return RemoteStore.indexAsync(this, options, { path }).then(
      (objectsArray) => {
        // update local store
        for (var i in objectsArray) {
          let object = objectsArray[i];
          let key = this.idParam(object);
          store[key] = stringify(object);
        }

        if (sortBy) {
          objectsArray = Util.sortArray(objectsArray, sortBy);
        }

        return Promise.resolve(objectsArray);
      }
    );
  }

  static clear() {
    // Should only clear prefixed items in the future
    objects.clear();
  }

  // This class assumes you are using a Bearer token (OAuth2) to access resources
  static setAccessToken(token) {
    LocalStore.accessToken = LocalStore.store['access_token'] = token;
  }

  // ex: users-R31
  static idParam(object) {
    let id = object;
    if (object['id']) {
      id = object.id;
    }
    return this.prefix + 'R' + id;
  }
}

LocalStore.prefix = 'object-';
LocalStore.store = objects;
LocalStore.accessToken = LocalStore.store['access_token'];

export default LocalStore;
