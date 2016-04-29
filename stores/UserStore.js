'use strict';

import LocalStore from 'stores/LocalStore';

class UserStore extends LocalStore {
}

UserStore.prefix = 'user-';
UserStore.resourceNamePlural = 'users';

UserStore.loadCurrentUser = () => {
  return UserStore.load('me').then(
    (user) => {
      let idParam = UserStore.idParam('me');
      UserStore.store[idParam] = JSON.stringify(user);
      return Promise.resolve(user);
    },
    Promise.reject
  );
}

UserStore.currentUser = () => {
  let idParam = UserStore.idParam('me');
  return UserStore.find(idParam);
}

export default UserStore;
