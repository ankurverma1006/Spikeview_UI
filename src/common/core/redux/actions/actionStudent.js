import {
  GET_EDUCATION_BY_USER,
  GET_ALL_COMPETENCY,
  GET_ACHIEVEMENT_BY_USER,
  GET_All_ORAGNIZATION,
  GET_ACHIEVEMENT_BY_ID,
  GET_RECOMMENDATION_BY_USER,
  GET_ACHIEVEMENT_DATA
} from '../types';
import spikeViewApiService from '../../api/apiService';

export const actionGetAllEducation = userId => {
  const request = spikeViewApiService('getAllEducation', { userId });
  return {
    type: GET_EDUCATION_BY_USER,
    payload: request
  };
};

export const actionGetAllCompetency = () => {
  const request = spikeViewApiService('getAllCompetency');
  return {
    payload: request,
    type: GET_ALL_COMPETENCY
  };
};

export const actionGetAchievementsByUser = userId => {
  const request = spikeViewApiService('listAchievementByUser', { userId });
  return {
    payload: request,
    type: GET_ACHIEVEMENT_BY_USER
  };
};

export const actionGetAchievementsData = userId => {
  const request = spikeViewApiService('listAchievementByUser1', { userId });
  return {
    payload: request,
    type: GET_ACHIEVEMENT_DATA
  };
};

export const actionListOragnization = () => {
  const request = spikeViewApiService('ListOragnization');
  return {
    payload: request,
    type: GET_All_ORAGNIZATION
  };
};

export const actionGetRecommendationsByUser = userId => {
  const request = spikeViewApiService('listRecommendationByUser', { userId });
  return {
    payload: request,
    type: GET_RECOMMENDATION_BY_USER
  };
};
