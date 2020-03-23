import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import _ from 'lodash';
import { limitCharacter, getThumbImage } from '../../common/commonFunctions';
import spikeViewApiService from '../../common/core/api/apiService';
import CONSTANTS from '../../common/core/config/appConfig';
import StudentAchievment from './studentAchievment';
import StudentRecommendation from './studentRecommendation';
import StudentBadges from './studentBadges';
import StudentCertificates from './studentCertificates';

class StudentNarrative extends Component {
  constructor(props) {
    super(props);
    this.state = {
      achievementData: [],
      recommandationData: [],
      showRecommendationComponent: false
    };
  }

  componentWillMount() {
    this.setProfileData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.setProfileData(nextProps);
  }

  setProfileData = data => {
    if (data) {
      let userId = data.sharedUserId;
      let achievementData = data.achievementData;
      this.setState({
        achievementData: achievementData
      });
      this.getUserRecommendationInfo(userId);
    }
  };

  showRecommendationComponent = (recommandationData, competencyName) => {
    this.setState({
      showRecommendationComponent: !this.state.showRecommendationComponent,
      recommandationData,
      competencyName
    });
  };

  getUserRecommendationInfo = userId => {
    spikeViewApiService('listRecommendationByUser', { userId })
      .then(response => {
        if (response.data.status === 'Success') {
          let userRecommendations = response.data.result;
          let recommandationData = response.data.result;
          if (userRecommendations.length > 0) {
            userRecommendations = _.filter(userRecommendations, {
              stage: 'Added'
            });
          }

          if (recommandationData.length > 0) {
            recommandationData = _.filter(recommandationData, {
              stage: 'Added'
            });
          }

          this.setState({
            recommandationData: recommandationData,
            userRecommendations: userRecommendations
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  render() {
    return (
      <div>
        <li className="myProfileInfo--item">
          <div className="flex">
            <div className="title--with--border">
              <p>My Narrative</p>
            </div>
          </div>
          {this.state.achievementData &&
          this.state.achievementData.length > 0 ? (
            this.state.achievementData.map((data, i) => {
              let tempObj = _.find(this.props.shareConfig, {
                competencyTypeId: data._id
              });

              return (
                <div
                  className="myProfileInfo--item--box"
                  key={i}
                  style={{
                    display:
                      tempObj.importance === CONSTANTS.rangeSliderHideValue
                        ? 'none'
                        : 'block'
                  }}
                >
                  <div className="section-main">
                    <div className="flex align-center justify-content-between">
                      <div className="section-main-title with-icon">
                        <span className={`${CONSTANTS.icons[data._id]}`} />
                        &nbsp;
                        {data.name}
                      </div>
                    </div>

                    <StudentAchievment
                      competencyId={data._id}
                      achievements={data.achievement}
                      shareConfig={_.find(this.props.shareConfig, function(o) {
                        return o.competencyTypeId === data._id;
                      })}
                    />
                  </div>

                  <StudentRecommendation
                    sharedUserId={this.props.sharedUserId}
                    competencyId={data._id}
                    competencyName={data.name}
                    recommendations={this.state.recommandationData}
                  />

                  <div className="section-main">
                    <Row>
                      <StudentBadges
                        competencyId={data._id}
                        achievements={data.achievement}
                        shareConfig={_.find(this.props.shareConfig, function(
                          o
                        ) {
                          return o.competencyTypeId === data._id;
                        })}
                      />
                      <StudentCertificates
                        competencyId={data._id}
                        achievements={data.achievement}
                        shareConfig={_.find(this.props.shareConfig, function(
                          o
                        ) {
                          return o.competencyTypeId === data._id;
                        })}
                      />
                    </Row>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="myProfileInfo--item--box">
              <div className="content-box p-2">No data available</div>
            </div>
          )}
        </li>

        {this.state.userRecommendations &&
        this.state.userRecommendations.length > 0 ? (
          <li className="myProfileInfo--item">
            <div className="title--with--border">
              <p>Recommendation</p>
            </div>
            <div className="myProfileInfo--item--box">
              <Row className="show-grid">
                {this.state.userRecommendations.slice(0, 3).map(
                  (item, index) =>
                    index <= 2 ? (
                      <Col md={4} key={index}>
                        <div className="u-rec text-center">
                          {item.recommender.profilePicture ? (
                            <img
                              className="object-fit-cover"
                              src={getThumbImage(
                                'small',
                                item.recommender.profilePicture
                              )}
                              alt=""
                            />
                          ) : (
                            <span className="icon-user_default2 default-icon centeredBox ma" />
                          )}

                          <h5 className="m-t-15">
                            {item.recommender.firstName} &nbsp;
                            {item.recommender.lastName}
                          </h5>
                          <p className="m-t-15 u-summary">
                            {item.stage === 'Requested'
                              ? item.title
                              : limitCharacter(item.recommendation, 200)}
                          </p>

                          <button
                            className="btn-link m-t-15"
                            onClick={this.showRecommendationComponent.bind(
                              this,
                              item,
                              ''
                            )}
                          >
                            Read More
                          </button>
                        </div>
                      </Col>
                    ) : (
                      ''
                    )
                )}
              </Row>
              <div className="text-center">
                <button
                  className="btn btn-primary md-btn"
                  onClick={() =>
                    this.props.history.push({
                      pathname: '/student/recommendations',
                      state: {
                        loggedInUser: this.props.sharedUserId,
                        type: 'shareProfile'
                      }
                    })
                  }
                >
                  See All
                </button>
              </div>
            </div>
          </li>
        ) : (
          ''
        )}
      </div>
    );
  }
}

export default StudentNarrative;
