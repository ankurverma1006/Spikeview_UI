import React from 'react';
import _ from 'lodash';

import { limitCharacter } from '../../common/commonFunctions';

const studentRecommendation = props => {
  let recommendations = props.recommendations;
  if (recommendations && recommendations.length > 0) {
    recommendations = _.filter(recommendations, {
      competencyTypeId: props.competencyId
    });
  }
  return (
    <div>
      {recommendations && recommendations.length > 0 ? (
        <div className="section-main card">
          <div className="flex align-center justify-content-between">
            <div className="section-main-title with-icon">
              <span className="icon-recommandations icon" />
              Recommendations for &nbsp;
              {props.competencyName} <span>({recommendations.length})</span>
            </div>
          </div>

          <ul className="flex flex-list--row testimonials">
            {recommendations.map((recommendation, index) =>
              index <= 2 ? (
                <li key={index}>
                  <div className="t--img">
                    <span className="icon-user_default2 default-icon centeredBox" />
                  </div>
                  <div className="t--body">
                    <div className="t--name">
                      {recommendation.recommender.firstName}
                    </div>
                    <div className="t--content">
                      <p>
                        {recommendation.stage === 'Added'
                          ? limitCharacter(recommendation.recommendation, 85)
                          : limitCharacter(recommendation.title, 85)}
                      </p>
                    </div>
                  </div>
                </li>
              ) : (
                ''
              )
            )}
          </ul>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default studentRecommendation;
