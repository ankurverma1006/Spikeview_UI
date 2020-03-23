import React, { Component } from 'react';
import Header from '../../../header/header';
import { Button, Media, Breadcrumb } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom';
import { confirmAlert } from 'react-confirm-alert';

import { actionGetRecommendationsByUser } from '../../../../common/core/redux/actions';
import spikeViewApiService from '../../../../common/core/api/apiService';
import { getThumbImage } from '../../../../common/commonFunctions';

class RecommendationList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userRecommendations: [],
      subscriberCount: 0,
      firstName: ''
    };
  }

  componentWillMount() {
    document.body.classList.add('light-theme');
    document.body.classList.remove('absoluteHeader');
  }

  componentWillReceiveProps(nextProps) {
    let userRecommendations = this.props.student.recommendationData;
    this.setState({
      userRecommendations
    });
  }

  componentDidMount() {
    let loggedInUser = this.props.location.state.loggedInUser;
    let searchUserId = this.props.location.state.searchUserId;
    let profileType = this.props.location.state.type
      ? this.props.location.state.type
      : '';

    console.log('profileType -- ',profileType);

    this.getRecommendationsByUser(loggedInUser);
    this.getUserPersonalInfo(loggedInUser);
    this.getSubscribersCount(loggedInUser);
    let userRecommendations = this.props.student.recommendationData;

    this.setState({
      userRecommendations,
      profileType,
      searchUserId
    });
  }

  getSubscribersCount(userId) {
    spikeViewApiService('getSubscribersCount', { userId })
      .then(response => {
        if (response.data.status === 'Success') {
          let subscriberCount = response.data.result.length;
          this.setState({ subscriberCount });
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  getRecommendationsByUser = userId => {
    this.props.actionGetRecommendationsByUser(userId);
  };

  getUserPersonalInfo = userId => {
    spikeViewApiService('getStudentPersonalInfo', { userId })
      .then(response => {
        if (response.data.status === 'Success') {
          let userData = response.data.result;
          if (userData) {
            let profileImage =
              userData.profilePicture && userData.profilePicture !== null
                ? getThumbImage('medium', userData.profilePicture)
                : '';
            let coverImage = userData.coverImage
              ? getThumbImage('original', userData.coverImage)
              : '';
            let firstName = userData.firstName || '';
            let lastName = userData.lastName || '';

            this.setState({
              profileImage,
              coverImage,
              firstName,
              lastName,
              userId
            });
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  addToProfileRecommendation = (recommendationId, userId) => {
    if (recommendationId) {
      let stage = 'Added';
      let data = {
        recommendationId,
        stage
      };
      spikeViewApiService('addToProfileRecommendation', data)
        .then(response => {
          if (response.data.status === 'Success') {
            this.getRecommendationsByUser(userId);
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  deleteRecommendation = (recommendationId, userId) => {
    if (recommendationId) {
      let self = this;
      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <div className="custom-ui">
              <p>Are you sure you want to delete this recommendation?</p>
              <button onClick={onClose}>No</button>
              <button
                onClick={() => {
                  let data = {
                    recommendationId
                  };

                  spikeViewApiService('deleteRecommendation', data)
                    .then(response => {
                      if (response && response.data.status === 'Success') {
                        self.getRecommendationsByUser(userId);
                        onClose();
                      }
                    })
                    .catch(err => {
                      console.log(err);
                    });
                }}
              >
                Yes, Delete it!
              </button>
            </div>
          );
        }
      });
    }
  };

  render() {
    return (
      <div className="innerWrapper">
        <Header {...this.props} />
        <div className="profileBox">
          <div className="profileBox--topbar">
            <div className="container">
              <div className="flex align-center justify-content-between">
                <div className="profile--info">
                  {this.state.profileImage === '' ? (
                    <div className="pp-default">
                      <span className="icon-user_default2" />
                    </div>
                  ) : (
                    <img
                      width="100px"
                      className="object-fit-cover img-responsive"
                      src={this.state.profileImage}
                      alt=""
                    />
                  )}
                  <div className="profile--name">
                    {this.state.firstName} {this.state.lastName}
                  </div>
                </div>
                <div className="pt--subscribe">
                  {/* <Button className="btn-with-border subscribe-btn">
                    Subscribe <span>{this.state.subscriberCount}</span>
                  </Button> */}

                  <Button className="btn btn-btn btn-with-border with-icon">
                    Subscribers{' '}
                    <strong className="numb--count">
                      {this.state.subscriberCount}
                    </strong>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="container main">
            <ul className="myProfileInfo--wrapper">
              <li className="myProfileInfo--item">
                <Breadcrumb>
                  <Breadcrumb.Item>
                    {this.state.searchUserId ? (
                      <Link to={`/student/profile/${this.state.searchUserId}`}>
                        {`${this.state.firstName ? this.state.firstName :''}'s Profile `}
                      </Link>
                    ) : (
                      <Link to="/student/profile">
                        {`${this.state.firstName ? this.state.firstName :''}'s Profile `}
                      </Link>
                    )}
                  </Breadcrumb.Item>
                  <Breadcrumb.Item active> Recommendations</Breadcrumb.Item>
                </Breadcrumb>
                <div className="title--with--border">
                  <p>Recommendations</p>
                </div>
                {this.state.userRecommendations &&
                this.state.userRecommendations.length > 0
                  ? this.state.userRecommendations.map(
                      (item, index) =>
                        this.state.userId === this.props.user.userId &&
                        this.state.profileType === '' ? (
                          <div
                            className="myProfileInfo--item--box"
                            key={index}
                            id={'recommendation_' + item.recommendationId}
                          >
                            <div className="content-box p-2">
                              <Media className="school-info--wrapper">
                                <Media.Left className="media-left--large">
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
                                    <span className="icon-user_default2 default-icon" />
                                  )}

                                  <div className="teachers-details wrap-long-words">
                                    <p className="t--name">
                                      {item.recommender.firstName} &nbsp;
                                      {item.recommender.lastName}
                                    </p>
                                    <p className="t--subject">
                                      {item.recommender.title}
                                    </p>
                                    <p className="t--class">
                                      {item.level2Competency}
                                    </p>

                                    {item.stage === 'Requested' ? (
                                      <div className="status pending">
                                        pending
                                      </div>
                                    ) : item.stage === 'Replied' ? (
                                      <Button
                                        bsStyle="btn btn-with-border with-icon smallBtn btn-block"
                                        onClick={this.addToProfileRecommendation.bind(
                                          this,
                                          item.recommendationId,
                                          item.userId
                                        )}
                                      >
                                        <span className="icon-plus" />
                                        Add to profile
                                      </Button>
                                    ) : (
                                      ''
                                    )}
                                  </div>

                                  {/* <p className="t--subject">
                                Science Professor
                              </p>
                              <p className="t--class">11th Grade</p> */}
                                </Media.Left>
                                <Media.Body>
                                  {/* <Media.Heading className="smallTitle">
                            Dear Admission Commettee
                          </Media.Heading> */}

                                  <p
                                    className="s--summary"
                                    style={{ whiteSpace: 'pre-wrap' }}
                                  >
                                    {item.stage === 'Requested'
                                      ? item.request
                                      : item.recommendation}
                                  </p>

                                  <div className="thankyou-msg--box">
                                    <p className="obedient-phrase">Sincerely</p>
                                    <div className="tmb--by">
                                      {item.stage === 'Requested' ? (
                                        <p className="t--name">
                                          {this.state.firstName || ''}{' '}
                                          {this.state.lastName || ''}
                                        </p>
                                      ) : (
                                        <p className="t--name">
                                          {item.recommender.firstName} &nbsp;
                                          {item.recommender.lastName}
                                        </p>
                                      )}
                                      {/* <p className="t--subject">
                                Science Professor
                              </p>
                              <p className="t--class">11th Grade</p> */}
                                    </div>
                                    {/* <p className="mt-1 primary-text">
                              Is this recommendation helpful?{' '}
                              <a href="#">
                                <i className="icon-thumb" />120
                              </a>
                            </p> */}
                                  </div>
                                </Media.Body>
                                {/* <buton
                                  className="btn del-btn btn-pos"
                                  onClick={this.deleteRecommendation.bind(
                                    this,
                                    item.recommendationId,
                                    item.userId
                                  )}
                                >
                                  Delete
                                </buton> */}
                                <span
                                  onClick={this.deleteRecommendation.bind(
                                    this,
                                    item.recommendationId,
                                    item.userId
                                  )}
                                  className="icon-delete btn-pos ico-del-btn"
                                />
                                <Link
                                  to={{
                                    pathname: '/student/recommendationdetail',
                                    state: {
                                      recommendationDetail: item ,
                                      type: this.state.profileType
                                    }
                                  }}
                                  className="absolute-link right-bottom"
                                >
                                  <span className="icon-forward-_arrow" />
                                </Link>
                              </Media>
                            </div>
                          </div>
                        ) : item.stage === 'Added' ? (
                          <div className="myProfileInfo--item--box" key={index}>
                            <div className="content-box p-2">
                              <Media className="school-info--wrapper">
                                <Media.Left className="media-left--large">
                                  {item.recommender.profilePicture ? (
                                    <img
                                      className="object-fit-cover"
                                      src={getThumbImage(
                                        'medium',
                                        item.recommender.profilePicture
                                      )}
                                      alt=""
                                    />
                                  ) : (
                                    <span className="icon-user_default2 default-icon centeredBox" />
                                  )}

                                  <div className="teachers-details wrap-long-words">
                                    <p className="t--name">
                                      {item.recommender.firstName} &nbsp;
                                      {item.recommender.lastName}
                                    </p>
                                    <p className="t--subject">
                                      {item.recommender.title}
                                    </p>
                                    <p className="t--class">
                                      {item.level2Competency}
                                    </p>
                                    {/* <p className="t--subject">
                                    Science Professor
                                  </p>
                                  <p className="t--class">11th Grade</p> */}
                                  </div>
                                </Media.Left>
                                <Media.Body>
                                  {/* <Media.Heading className="smallTitle">
                                Dear Admission Commettee
                              </Media.Heading> */}

                                  <p
                                    className="s--summary"
                                    style={{ whiteSpace: 'pre-wrap' }}
                                  >
                                    {item.stage === 'Added'
                                      ? item.recommendation
                                      : item.title}
                                  </p>

                                  <div className="thankyou-msg--box">
                                    <p className="obedient-phrase">Sincerely</p>
                                    <div className="tmb--by">
                                      <p className="t--name">
                                        {item.recommender.firstName} &nbsp;
                                        {item.recommender.lastName}
                                      </p>
                                      <Link
                                        to={{
                                          pathname:
                                            '/student/recommendationdetail',
                                          state: {
                                            recommendationDetail: item,
                                            type: 'searchProfile',
                                            searchUserId: this.state
                                              .searchUserId
                                              ? this.state.searchUserId
                                              : ''
                                          }
                                        }}
                                        className="absolute-link right-bottom"
                                      >
                                        <span className="icon-forward-_arrow" />
                                      </Link>
                                      {/* <p className="t--subject">
                                    Science Professor
                                  </p>
                                  <p className="t--class">11th Grade</p> */}
                                    </div>
                                    {/* <p className="mt-1 primary-text">
                                  Is this recommendation helpful?{' '}
                                  <a href="#">
                                    <i className="icon-thumb" />120
                                  </a>
                                </p> */}
                                  </div>
                                </Media.Body>
                              </Media>
                            </div>
                          </div>
                        ) : (
                          ''
                        )
                    )
                  : 'No records found'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.User.userData,
    student: state.Student
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      actionGetRecommendationsByUser
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RecommendationList);
