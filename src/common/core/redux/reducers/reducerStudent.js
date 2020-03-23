import {
  GET_EDUCATION_BY_USER,
  GET_ALL_COMPETENCY,
  GET_ACHIEVEMENT_BY_USER,
  GET_All_ORAGNIZATION,
  GET_RECOMMENDATION_BY_USER,
  GET_ACHIEVEMENT_DATA
} from '../types';

const INITIAL_STATE = {
  all: [],
  competencyData: [],
  achievementData: [],
  oragnizationData: [],
  recommendationData: [],
  onlyAchievement: []
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case GET_EDUCATION_BY_USER:
      if (action.payload && action.payload.data.result) {
        const educationInfo = action.payload.data.result;
        state.all = educationInfo;
      }
      return Object.assign({}, state);

    case GET_ALL_COMPETENCY:
      if (action.payload && action.payload.data.result) {
        state.competencyData = action.payload.data.result;
      }
      return Object.assign({}, state);

    case GET_ACHIEVEMENT_BY_USER:
      if (action.payload && action.payload.data.result) {
        state.achievementData = action.payload.data.result;
      }
      return Object.assign({}, state);

    case GET_ACHIEVEMENT_DATA:
      if (action.payload && action.payload.data.result) {
        state.onlyAchievement = action.payload.data.result;
      }
      return Object.assign({}, state);

    case GET_All_ORAGNIZATION:
      if (action.payload && action.payload.data.result) {
        state.oragnizationData = action.payload.data.result;
      }
      return Object.assign({}, state);

    case GET_RECOMMENDATION_BY_USER:
      if (action.payload && action.payload.data.result) {
        state.recommendationData = action.payload.data.result;
      }
      return Object.assign({}, state);

    default:
      return state;
  }
};
