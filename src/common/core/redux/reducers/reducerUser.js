import {
  USER_LOGIN,
  USER_LOGOUT,
  GET_STUDENT_PERSONAL_INFO,
  SET_STUDENT_AS_USER,
  GET_STUDENT_LIST,
  UPDATE_STUDENT_INFO,
  GET_HEADER_COUNT,
  UPDATE_HEADER_COUNT,
  CHANGE_PASSWORD_STATUS,
  REMOVE_STUDENT_DATA,
  UPDATE_USER_PERSONAL_INFO,
  UPDATE_PARENT_PERSONAL_INFO,
  UPDATE_FEED_GROUP_INFO,
  GROUP_LIST_DATA
} from '../types';
import {
  setLocalStorage,
  getLocalStorage,
  clearLocalStorage
} from '../../../commonFunctions';

const INITIAL_STATE = {
  userData: getLocalStorage('userInfo') || {},
  parentData: getLocalStorage('parentInfo')
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case USER_LOGIN:
      if (action.payload && action.payload.data && action.payload.data.result) {
        let userInfo = action.payload.data.result || {};
        if (userInfo.roleId === 1) {
          state.userData = userInfo;
          state.parentData = null;
          setLocalStorage('parentInfo', null);
        }
        //else if (
        //   userInfo.roleId === 2 &&
        //   userInfo.students &&
        //   userInfo.students.length === 1
        // ) {
        //   state.parentData = userInfo;
        //   setLocalStorage('parentInfo', userInfo);
        //   userInfo.students[0]['token'] = userInfo['token'];
        //   userInfo = userInfo.students[0];
        //   state.userData = userInfo;
        // }
        else if (userInfo.roleId === 2) {
          state.parentData = userInfo;
          setLocalStorage('parentInfo', userInfo);
          //  userInfo.students[0]['token'] = userInfo['token'];
          state.userData = userInfo;
        } else {
          state.userData = userInfo;
        }
        setLocalStorage('userInfo', userInfo);
      }
      return Object.assign({}, state);

    case GET_STUDENT_PERSONAL_INFO:
      if (action.payload && action.payload.data && action.payload.data.result) {
        const object = action.payload.data.result;
        let userInfo = getLocalStorage('userInfo');

        for (const key in object) {
          if (object.hasOwnProperty(key)) {
            const element = object[key];
            userInfo[key] = element;
            state[key] = element;
          }
        }
        state.userData = userInfo;
        setLocalStorage('userInfo', userInfo);
      }
      return Object.assign({}, state);

    case USER_LOGOUT:
      state.userData = {};
      state.parentData = null;
      state.headerCount = null;
      clearLocalStorage();
      return Object.assign({}, state);

    case SET_STUDENT_AS_USER:
      if (
        action.payload &&
        action.payload.parent &&
        action.payload.studentData
      ) {
        const parentInfo = action.payload.parent;
        let userInfo = action.payload.studentData;
        state.userData = userInfo;
        state.parentData = parentInfo;
        setLocalStorage('parentInfo', parentInfo);
        setLocalStorage('userInfo', userInfo);
      }
      return Object.assign({}, state);

    case GET_STUDENT_LIST:
      if (action.payload) {
        const userInfoStudent = action.payload.data.result;
        let userInfo = getLocalStorage('parentInfo')
          ? getLocalStorage('parentInfo')
          : getLocalStorage('userInfo');
        userInfo.students = userInfoStudent;
        state.userData = userInfo;
        state.parentData = userInfo;
        setLocalStorage('parentInfo', userInfo);
        setLocalStorage('userInfo', userInfo);
      }
      return Object.assign({}, state);

    case UPDATE_STUDENT_INFO:
      if (action.payload && action.payload.data.userId) {
        let userInfo = state.userData;
        state.userData.students[action.payload.data.index].isActive =
          action.payload.data.isActive;
        setLocalStorage(
          state.userData.students[action.payloaddata.data.index].isActive,
          true
        );
      }
      return Object.assign({}, state);

    case GET_HEADER_COUNT:
      if (
        action.payload &&
        action.payload.data &&
        action.payload.data.result[0]
      ) {
        const headerCountMessage = action.payload.data.result[0];
        state.headerCount = headerCountMessage;
      }
      return Object.assign({}, state);

    case UPDATE_HEADER_COUNT:
      if (action) {
        let headerCount = action.payload;
        headerCount['connectionCount'] =
          headerCount.connectionCount === '0' ? 0 : headerCount.connectionCount;
        headerCount['messagingCount'] =
          headerCount.messagingCount === '0' ? 0 : headerCount.messagingCount;
        headerCount['notificationCount'] =
          headerCount.notificationCount === '0'
            ? 0
            : headerCount.notificationCount;
        state.headerCount = headerCount;
      }
      return Object.assign({}, state);

    case CHANGE_PASSWORD_STATUS:
      let userInfo = getLocalStorage('parentInfo')
        ? getLocalStorage('parentInfo')
        : getLocalStorage('userInfo');
      console.log(userInfo['isPasswordChanged']);
      userInfo['isPasswordChanged'] = true;
      state.userData = userInfo;
      if (getLocalStorage('parentInfo')) {
        state.parentData = userInfo;
        setLocalStorage('parentInfo', userInfo);
      }
      setLocalStorage('userInfo', userInfo);
      return Object.assign({}, state);

    case REMOVE_STUDENT_DATA:
      if (action.payload && action.payload.userId) {
        let userInfo = getLocalStorage('parentInfo');
        if (getLocalStorage('parentInfo')) {
          userInfo['students'].splice(
            userInfo['students'].findIndex(
              todo => todo.userId === parseInt(action.payload.userId, 10)
            ),
            1
          );
          state.parentData = userInfo;
          state.userData = userInfo;
          setLocalStorage('parentInfo', userInfo);
          setLocalStorage('userInfo', userInfo);
        }
      }
      return Object.assign({}, state);

    case UPDATE_USER_PERSONAL_INFO:
      if (action.payload) {
        const object = action.payload;
        let userInfo = getLocalStorage('userInfo');

        for (const key in object) {
          if (object.hasOwnProperty(key)) {
            const element = object[key];
            userInfo[key] = element;
            state[key] = element;
          }
        }
        state.userData = userInfo;
        setLocalStorage('userInfo', userInfo);
      }
      return Object.assign({}, state);

    case UPDATE_PARENT_PERSONAL_INFO:
      if (action.payload) {
        const object = action.payload;
        console.log(object);
        let parentInfo = getLocalStorage('parentInfo');

        for (const key in object) {
          if (object.hasOwnProperty(key)) {
            const element = object[key];
            parentInfo[key] = element;
            state[key] = element;
          }
        }
        state.parentData = parentInfo;
        setLocalStorage('parentInfo', parentInfo);
      }
      return Object.assign({}, state);

    case UPDATE_FEED_GROUP_INFO:
      if (action.payload) {
        console.log(action.payload);
        state.groupInfoData = action.payload;
        if (state.groupListData) {
          let groupListData = state.groupListData;
          let index = state.groupListData.findIndex(
            todo => todo.groupId == action.payload.groupId
          );
          if (index !== -1) {
            groupListData[index] = action.payload;
            state.groupListData = groupListData;
          }
        }
      }
      return Object.assign({}, state);

    case GROUP_LIST_DATA:
      if (action.payload && action.payload.data.result) {
        state.groupListData = action.payload.data.result;
      }
      return Object.assign({}, state);

    default:
      return state;
  }
};
