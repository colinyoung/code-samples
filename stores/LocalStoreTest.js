/*eslint-env node, mocha */
/*global expect */
/*eslint no-console: 0*/
'use strict';

import LocalStore from 'stores/LocalStore';
import RemoteStore from 'stores/RemoteStore';
import Colleges from 'stores/CollegeStore';

var fetchMock = require('fetch-mock');

describe('LocalStore', () => {
  let store = LocalStore;
  let testObject;
  let idParam;

  it('should define prefix', () => {
    expect(store.prefix).to.equal('object-');
  });

  describe('inserted object', () => {
    beforeEach((done) => {
      store.clear();
      testObject = { date: Date.now(), name: "test" };
      store.insert(testObject).then((object) => {
        idParam = LocalStore.idParam(object);
        done();
      });
    });

    it('should let you call first()', () => {
      expect(store.first()).to.eql(testObject);
    });

    it('should let you retrieve via key', () => {
      expect(store.find(idParam)).to.eql(testObject);
      expect(store.get(idParam)).to.eql(testObject);
    });

    it('should let you call all()', () => {
      expect(store.all()).to.eql([testObject]);
    });

    it('should let you update, with merging', (done) => {
      store.update(idParam, { name: "test2"}).then(() => {
        let testObjectClone = testObject;
        testObjectClone.name = "test2";
        expect(store.find(idParam)).to.eql(testObjectClone);
        done();
      });
    });

    it('should let you delete', (done) => {
      const mockURL = RemoteStore.baseURL(Colleges) + '/' + idParam;
      fetchMock.mock(
        mockURL,
        'DELETE',
        { }
      );

      expect(store.find(idParam)).to.eql(testObject);
      store.delete(idParam).then(() => {
        expect(store.find(idParam)).to.be.undefined;
        done();
      });
    });
  });
});
