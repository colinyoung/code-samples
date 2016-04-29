'use strict';

import appConfig from '../../app.config';
import LocalStore from 'stores/LocalStore';
import querystring from 'querystring';

const MIMEType = 'application/json';

class RemoteStore {
  static indexAsync(store, query, options) {
    options = options || {};
    let indexURL = this.baseURL(store, options.path);

    if (Object.keys(query).length > 0) {
      indexURL += '?' + querystring.encode(query);
    }

    return fetch(indexURL, this.requestHeaders())
              .then(this.getJSONResponse);
  }

  static showAsync(store, id) {
    return fetch(this.baseURL(store) + '/' + id, this.requestHeaders())
              .then(this.getJSONResponse);
  }

  static createAsync(store, object, createPath) {
    let options = Object.assign(this.requestHeaders(), {
      method: 'POST',
      body: JSON.stringify(object)
    });

    return fetch(this.baseURL(store, createPath), options)
              .then(this.getJSONResponse)
  }

  static updateAsync(store, object) {
    let options = Object.assign(this.requestHeaders(), {
      method: 'PUT',
      body: JSON.stringify(object)
    });

    return fetch(this.baseURL(store) + '/' + object.id, options)
              .then(this.getJSONResponse)
  }

  static deleteAsync(store, id) {
    let options = Object.assign(this.requestHeaders(), {
      method: 'DELETE'
    });
    return fetch(this.baseURL(store) + '/' + id, options)
  }

  static customAsync(store, path, params) {
    let options = Object.assign(this.requestHeaders(), {
      method: 'GET'
    });
    return fetch(this.baseURL(store, path, params), options);
  }

  static baseURL(store, path, query) {
    let prefix = store.urlPrefix || RemoteStore.urlPrefix || '';
    path = path || store.resourceNamePlural;
    let baseURL = appConfig.API_BASE_URL + prefix + '/' + path;
    if (query) {
      baseURL += '?' + querystring.encode(query);
    }
    return baseURL;
  }

  static requestHeaders() {
    return {
      headers: {
        'Authorization' : 'Bearer ' + LocalStore.accessToken,
        'Accept' : MIMEType,
        'Content-Type' : MIMEType
      }
    };
  }

  static getJSONResponse(response) {
    if (response.status >= 200 && response.status < 300) {
      if (response.status == 204) { // No Content
        return Promise.resolve();
      }
      let contentType = response.headers.get('content-type');
      if (contentType && !!contentType.split(';')[0].match(/json$/)) {
        return response.json();
      } else {
        return Promise.resolve();
      }
    }

    return Promise.reject(response);
  }
}

RemoteStore.urlPrefix = '';

export default RemoteStore;
