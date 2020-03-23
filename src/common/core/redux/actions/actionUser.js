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
import spikeViewApiService from '../../api/apiService';

export const actionUserLogin = data => {
  const request = spikeViewApiService('login', data);
  return {
    type: USER_LOGIN,
    payload: request
  };
};

export const actionUserLogout = () => {
  const request = spikeViewApiService('logout');
  return {
    type: USER_LOGOUT,
    payload: request
  };
};

export const actionGetStudentPersonalInfo = userId => {
  const request = spikeViewApiService('getStudentPersonalInfo', { userId });
  return {
    type: GET_STUDENT_PERSONAL_INFO,
    payload: request
  };
};

export const actionSetStudentAsUser = data => {
  return {
    type: SET_STUDENT_AS_USER,
    payload: { parent: data.parent, studentData: data.studentData }
  };
};

export const actionGetStudentList = userId => {
  const request = spikeViewApiService('getStudentsByParentProfile', { userId });
  return {
    type: GET_STUDENT_LIST,
    payload: request
  };
};

export const actionGetStudentUpdatedInfo = data => {
  const request = data;
  return {
    type: UPDATE_STUDENT_INFO,
    payload: request
  };
};

export const actionGetHeaderCount = userId => {
  const request = spikeViewApiService('getHeaderCount', { userId });
  return {
    type: GET_HEADER_COUNT,
    payload: request
  };
};

export const actionUpdateHeaderCount = data => {
  const request = spikeViewApiService('updateHeaderCount', data);
  return {
    type: UPDATE_HEADER_COUNT,
    payload: data
  };
};

export const actionChangePasswordStatus = () => {
  return {
    type: CHANGE_PASSWORD_STATUS
  };
};

export const actionRemoveStudent = data => {
  return {
    type: REMOVE_STUDENT_DATA,
    payload: data
  };
};

export const actionUpdateUserInfo = data => {
  const request = data;
  return {
    type: UPDATE_USER_PERSONAL_INFO,
    payload: request
  };
};

export const actionUpdateGroupInfo = data => {
  const request = data;
  return {
    type: UPDATE_FEED_GROUP_INFO,
    payload: request
  };
};

export const actionSetGroupList = userId => {
  console.log(userId);
  const request = spikeViewApiService('getGroupListByUser', userId);
  return {
    type: GROUP_LIST_DATA,
    payload: request
  };
};

export const actionUpdateParentInfo = data => {
  const request = data;
  return {
    type: UPDATE_PARENT_PERSONAL_INFO,
    payload: request
  };
};
