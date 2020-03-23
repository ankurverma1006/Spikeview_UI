import { combineReducers } from 'redux';

import User from './reducerUser';
import Student from './reducerStudent';

const appReducer = combineReducers({
  state: (state = {}) => state,
  User,
  Student
});

const rootReducer = (state, action) => {
  if (action.type === 'USER_LOGOUT') {
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;
