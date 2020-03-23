import React, { Component } from 'react';
import { Modal,Row, Col, Media, Button } from 'react-bootstrap';
import Slider from 'react-slick';
import _ from 'lodash';
import moment from 'moment';
import { ToastContainer } from 'react-toastify';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import spikeViewApiService from '../../common/core/api/apiService';
import CONSTANTS from '../../common/core/config/appConfig';
import Header from '../header/header';
import ParentHeader from '../../parent/header/header';
import SpiderChart from '../../common/spiderChart/spiderChart';
import achievementDefaultImage from '../../assets/img/default_achievement.jpg';
import CompetencyRecommendations from '../profile/competency/recommendations/competencyWiseRecommendations';
import {
  ZoomInAndOut,
  limitCharacter,
  SampleNextArrow,
  SamplePrevArrow,
  getThumbImage
} from '../../common/commonFunctions';
import StudentSummary from '../previewSharedProfile/studentSummary';
import StudentEducation from '../previewSharedProfile/studentEducation';
import ViewAchievement from '../profile/competency/achievements/viewAchievement';

var settings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 3,
  swipeToSlide: true,
  nextArrow: <SampleNextArrow props={this.props} />,
  prevArrow: <SamplePrevArrow props={this.props} />,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3,
        infinite: true,
        dots: true
      }
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
        initialSlide: 2
      }
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1
      }
    }
  ]
};

var settingsCompetency = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 2,
  swipeToSlide: true,
  nextArrow: <SampleNextArrow props={this.props} />,
  prevArrow: <SamplePrevArrow props={this.props} />,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 3,
        infinite: true,
        dots: true
      }
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
        initialSlide: 2
      }
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1
      }
    }
  ]
};

let photoGallery = {
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  swipeToSlide: true,
  nextArrow: <SampleNextArrow props={this.props} />,
  prevArrow: <SamplePrevArrow props={this.props} />
}; 

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recommendationModal: false,
      userId: '',
      profileImage: '',
      coverImage: '',
      firstName: '',
      lastName: '',
      tagline: '',
      summary: '',
      educationData: [],
      achievementData: [],
      recommandationData: [],
      showRecommendationComponent: false,
      loggedInUser: '',
      requested: false,
      subscribed: false,
      subscribeId: '',
      accepted: false,
      disabled: false,
      connectId: '',
      viewAchievement: false,
      sliderImages: [],
      imagesPopup: false  
    };
  }

  componentWillMount() {
    document.body.classList.add('absoluteHeader');
    document.body.classList.add('light-theme');
    document.body.classList.remove('home');
    document.body.classList.remove('fixedHeader');
    this.setNotification();
  }

  componentDidMount() {
    let userId = this.props.match.params.id;
    let loggedInUser = this.props.parent
      ? this.props.parent.userId
      : this.props.user.userId;
    this.setState({ userId, loggedInUser });
    if (userId && loggedInUser) {
      this.getUserPersonalInfo(userId);
      this.getUserEducationInfo(userId);
      this.getUserAchievementInfo(userId);
      this.getUserRecommendationInfo(userId);
      this.getUserCount(userId);
      this.checkConnectionRequestStatus(userId, loggedInUser);
      this.checkSubscribeRequestStatus(userId, loggedInUser);
    }
  }

  setNotification() {
    console.log('set notificaton----------');
    let dateTime = new Date().valueOf();
    let text =
      this.props.user.firstName +
      ' ' +
      (this.props.user.lastName ? this.props.user.lastName : '') +
      ' viewed your profile';
    let feedId = '';
    let flag = false;
    let userId = this.props.match.params.id;
    let notificationData = {
      userId: userId,
      actedBy: this.props.user.userId,
      profilePicture: this.props.user.profilePicture,
      feedId,
      text,
      dateTime,
      flag
    };
    spikeViewApiService('postNotification', notificationData);
  }

  componentWillReceiveProps(nextProps) {
    let userId = nextProps.match.params.id;
    let loggedInUser = this.props.parent
      ? this.props.parent.userId
      : this.props.user.userId;
    this.setState({ userId, loggedInUser });
    if (userId && loggedInUser) {
      this.getUserPersonalInfo(userId);
      this.getUserEducationInfo(userId);
      this.getUserAchievementInfo(userId);
      this.getUserRecommendationInfo(userId);
      this.getUserCount(userId);
      this.checkConnectionRequestStatus(userId, loggedInUser);
      this.checkSubscribeRequestStatus(userId, loggedInUser);
    }
  }

  //console.log(this.props);

  //let userId = nextProps.location.state.userId;
  // let userId = nextProps.match.params.id;
  //let loggedInUser = nextProps.location.state.loggedInUser;

  getUserPersonalInfo = userId => {
    spikeViewApiService('getStudentPersonalInfo', { userId })
      .then(response => {
        if (response.data.status === 'Success') {
          let userData = response.data.result;
          if (userData) {
            let profileImage = userData.profilePicture
              ? getThumbImage('medium', userData.profilePicture)
              : '';
            let coverImage = userData.coverImage
              ? getThumbImage('medium', userData.coverImage)
              : '';
            let firstName = userData.firstName || '';
            let lastName = userData.lastName || '';
            let tagline = userData.tagline || '';
            let summary = userData.summary || 'Not available';
            this.setState({
              profileImage,
              coverImage,
              firstName,
              lastName,
              tagline,
              summary,
              userData
            });
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  getUserEducationInfo = userId => {
    spikeViewApiService('getAllEducation', { userId })
      .then(response => {
        if (response.data.status === 'Success') {
          this.setState({ educationData: response.data.result });
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  getUserAchievementInfo = userId => {
    spikeViewApiService('listAchievementByUser', { userId })
      .then(response => {
        if (response.data.status === 'Success') {
          this.setState({ achievementData: response.data.result });
        }
      })
      .catch(err => {
        console.log(err);
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

  renderMedia = (
    mediaData,
    achievement,
    level1Competency,
    level2CompetencyId
  ) => {
    var imgSource = '';

    if (mediaData.length === 0) {
      imgSource = achievementDefaultImage;
    } else {
      var assetData = _.filter(mediaData, {
        tag: 'media'
      });

      var certificatesData = _.filter(mediaData, {
        tag: 'certificates'
      });

      var badgesData = _.filter(mediaData, {
        tag: 'badges'
      });

      if (assetData.length > 0) {
        imgSource = `${CONSTANTS.azureBlobURI}/${CONSTANTS.azureContainer}/${
          assetData[0].file
        }`;
      } else if (certificatesData.length > 0) {
        imgSource = `${CONSTANTS.azureBlobURI}/${CONSTANTS.azureContainer}/${
          certificatesData[0].file
        }`;
      } else if (badgesData.length > 0) {
        imgSource = `${CONSTANTS.azureBlobURI}/${CONSTANTS.azureContainer}/${
          badgesData[0].file
        }`;
      } else {
        imgSource = achievementDefaultImage;
      }
    }
    // return <img className="img-responsive" src={imgSource} alt="" />;
    return (
      <div>
        <img
          className="img-responsive"
          src={imgSource}
          onClick={this.openAchievementPage.bind(
            this,
            achievement.achievementId,
            achievement,
            level1Competency
          )}
          alt=""
        />

        {this.state['viewAchievement_' + achievement.achievementId] === true ? (
          <ViewAchievement
            achievementData={this.state.achievementData}
            level1Competency={this.state.level1Competency}
            achievementDetail={this.state.achievementDetail}
            closeViewAchievement={this.openAchievementPage}
            getAchievementsByUser={this.getAchievementsByUser}
            type="Search"
            {...this.props}
          />
        ) : (
          ''
        )}
      </div>
    );
  };

  openAchievementPage = (achievementId, achievement, level1Competency) => {
    if (achievement && level1Competency) {
      this.setState({
        ['viewAchievement_' + achievementId]: !this.state[
          'viewAchievement_' + achievementId
        ],

        // viewAchievement: !this.state.viewAchievement,
        achievementDetail: achievement,
        level1Competency
      });
    } else {
      this.setState({
        ['viewAchievement_' + achievementId]: !this.state[
          'viewAchievement_' + achievementId
        ]
      });
    }
  };

  renderAchievement = (achievements, data) => {
    return (
      <Slider {...settings} className="slider">
        {achievements.map((achievement, index) => (
          <div className="slider-item" key={index}>
            <a>
              <span className="image-section">
                {/* <span className="image-section-links">
                  <div className="likes--count">
                    <span className="icon-camera icon icon" />
                    23
                  </div>
                  <span className="image-section--category">12th Grade</span>
                </span> */}
                {this.renderMedia(
                  achievement.asset,
                  achievement,
                  data.level1,
                  data._id
                )}
                {/*achievement.asset.length === 0 &&
                achievement.certificate.length === 0 &&
                achievement.badge.length === 0 ? (
                  <img
                    className="img-responsive"
                    src={achievementDefaultImage}
                    alt=""
                  />
                ) : achievement.asset[0].type === 'image' ? (
                  <img
                    className="img-responsive"
                    src={`${azureURL}/${achievement.asset[0].file}`}
                    alt=""
                  />
                ) : (
                  <img
                    className="img-responsive"
                    src={achievementDefaultImage}
                    alt=""
                  />
                )*/}
              </span>
              <span className="image-section-title">
                {limitCharacter(achievement.title, 32)}
              </span>
            </a>
          </div>
        ))}
      </Slider>
    );
  };

  // openAchievementPage = (achievement, data) => {
  //   this.props.history.push({
  //     pathname: '/student/achievementdetail',
  //     state: { achievementDetails: achievement, name: data.name }
  //   });
  // };

  renderBadges(achievements) {
    let bagesArray = [];
    if (achievements.length > 0) {
      achievements.map((item, index) => {
        if (item.asset.length > 0) {
          item.asset.map((badge, index) => {
            badge.tag === CONSTANTS.badgeAlbum            
              ? bagesArray.push({ badge: badge.file, title: item.title })
              : '';
          });
        }
      });
    }

    return (
      <div>
        {bagesArray.length > 0 ? (
          <Col sm={4}>
            <div className="card">
              <div className="section-main-title with-icon">
                <span className="icon-badges icon" />
                Badges
              </div>
              <Slider {...settingsCompetency} className="slider">
                {bagesArray.map((badge, index) => (
                  <div className="slider-item square" key={index}>
                    <a>
                      <span className="image-section">
                        <img
                          className="img-responsive"
                          src={getThumbImage('small', badge.badge)}
                          alt="Badge"
                          onClick={() => this.imagesPopup(badge.badge)}
                        />
                      </span>
                      <span className="image-section-title" title={badge.title}>
                        {limitCharacter(badge.title, 50)}
                      </span>
                    </a>
                  </div>
                ))}
              </Slider>
            </div>
          </Col>
        ) : null}
      </div>
    );
  }

  renderCertificates(achievements) {
    let certificateArray = [];
    if (achievements.length > 0) {
      achievements.map((item, index) => {
        if (item.asset.length > 0) {
          item.asset.map((certificate, index) => {
            certificate.tag === CONSTANTS.certificateAlbum
              ? certificateArray.push({
                  certificate: certificate.file,
                  title: item.title
                })
              : '';
          });
        }
      });
    }

    return (
      <div>
        {certificateArray.length > 0 ? (
          <Col sm={4}>
            <div className="card">
              <div className="section-main-title with-icon">
                <span className="icon-certificate icon" />
                Certificates
              </div>
              <Slider {...settingsCompetency} className="slider">
                {certificateArray.map((certificate, index) => (
                  <div className="slider-item square" key={index}>
                    <a>
                      <span className="image-section">
                        <img
                          className="img-responsive"
                          src={getThumbImage('small', certificate.certificate)}
                          alt="certificate"
                          onClick={() => this.imagesPopup(certificate.certificate)}
                        />
                      </span>
                      <span
                        className="image-section-title"
                        title={certificate.title}
                      >
                        {limitCharacter(certificate.title, 50)}
                      </span>
                    </a>
                  </div>
                ))}
              </Slider>
            </div>
          </Col>
        ) : null}
      </div>
    );
  }

  renderTrophies(achievements) {
    let trophyArray = [];
    if (achievements.length > 0) {
      achievements.map((item, index) => {
        if (item.asset.length > 0) {
          item.asset.map((trophy, index) => {           
            trophy.tag === CONSTANTS.trophieAlbum
              ? trophyArray.push({ trophy: trophy.file, title: item.title })
              : '';
          });
        }
      });
    }

    return (
      <div>
        {trophyArray.length > 0 ? (
          <Col sm={4}>
            <div className="card">
              <div className="section-main-title with-icon">
                <span className="icon-trophy icon" />
                Trophies
              </div>
              <Slider {...settingsCompetency} className="slider">
                {trophyArray.map((trophy, index) => (
                  <div className="slider-item square" key={index}>
                    <a>
                      <span className="image-section">
                        <img
                          className="img-responsive"
                          src={getThumbImage('small', trophy.trophy)}
                          alt="Badge"
                          onClick={() => this.imagesPopup(trophy.trophy)}
                        />
                      </span>
                      <span className="image-section-title" title={trophy.title}>
                        {limitCharacter(trophy.title, 50)}
                      </span>
                    </a>
                  </div>
                ))}
              </Slider>
            </div>
          </Col>
        ) : null}
      </div>
    );
  }

  showRecommendationComponent = (recommandationData, competencyName) => {
    this.setState({
      showRecommendationComponent: !this.state.showRecommendationComponent,
      recommandationData,
      competencyName
    });
  };

  renderRecommendationsByCompetency(
    competencyId,
    competencyName,
    recommandations
  ) {
    var addedRecommendations = _.filter(recommandations, {
      stage: 'Added'
    });

    return (
      <div>
        {addedRecommendations && addedRecommendations.length > 0 ? (
          <div className="section-main card">
            <div className="flex align-center justify-content-between">
              <div className="section-main-title with-icon">
                <span className="icon-recommandations icon" />
                Recommendationsffd for &nbsp;
                {competencyName} <span>({addedRecommendations.length})</span>
              </div>

              {addedRecommendations.length > 3 ? (
                <a
                  onClick={() =>
                    this.props.history.push({
                      pathname: '/student/recommendations',
                      state: {
                        loggedInUser: this.state.userId
                      }
                    })
                  }
                  style={{ cursor: 'pointer' }}
                >
                  See All
                </a>
              ) : (
                ''
              )}
            </div>

            <ul className="flex flex-list--row testimonials">
              {addedRecommendations.map(
                (recommandation, index) =>
                  index <= 2 ? (
                    <li key={index}>
                      <div className="t--img">
                        <span className="icon-user_default2 default-icon centeredBox" />
                      </div>
                      <div className="t--body">
                        <div className="t--name">
                          {recommandation.recommender.firstName}
                        </div>
                        <div className="t--content">
                          <p>
                            {recommandation.stage === 'Added'
                              ? limitCharacter(
                                  recommandation.recommendation,
                                  85
                                )
                              : limitCharacter(recommandation.title, 85)}
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
  }

  connectRequest = () => {
    this.setState({
      disabled: true
    });
    let userId = this.state.loggedInUser;
    let partnerId = this.state.userId;
    let dateTime = moment().valueOf();
    let status = 'Requested';
    let isActive = true;

    let data = {
      userId,
      partnerId,
      dateTime,
      status,
      isActive
    };

    spikeViewApiService('addConnection', data)
      .then(response => {
        if (response.data.status === 'Success') {
          this.setState({
            requested: true,
            disabled: false,
            connectId: response.data.result.connectId
          });
        }
      })
      .catch(err => {
        this.setState({
          disabled: false
        });
        console.log(err);
      });
    this.setHeaderCount(partnerId);
  };

  setHeaderCount(partnerId) {
    let data = {
      userId: partnerId,
      connectionCount: 1,
      messagingCount: '',
      notificationCount: ''
    };
    // spikeViewApiService('updateHeaderCount', data);
  }

  getUserCount(userId) {
    let sharedId = 0;
    if (userId) {
      spikeViewApiService('getCount', { userId, sharedId })
        .then(response => {
          if (response && response.data.status === 'Success') {
            let accomplishments = response.data.result.achievement;
            let endorsements = response.data.result.endorsement;
            let recommendations = response.data.result.recommendation;
            this.setState({
              accomplishments,
              endorsements,
              recommendations
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  }

  checkConnectionRequestStatus = (partnerId, userId) => {
    spikeViewApiService('getConnectionStatus', { userId, partnerId })
      .then(response => {
        if (response.data.status === 'Success') {
          if (response.data.result.length === 0) {
            this.setState({
              requested: false,
              accepted: false
            });
          } else if (response.data.result[0].status === 'Requested') {
            this.setState({
              requested: true,
              connectId: response.data.result[0].connectId
            });
          } else if (response.data.result[0].status === 'Accepted') {
            this.setState({
              accepted: true
            });
          } else if (response.data.result[0].status === 'Rejected') {
            this.setState({
              requested: false
            });
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  cancelConnectRequest = () => {
    console.log('Ss');
    let connectId = this.state.connectId;
    if (connectId) {
      let data = {
        connectId
      };

      spikeViewApiService('deleteConnection', data)
        .then(response => {
          if (response.data.status === 'Success') {
            this.setState({
              requested: false,
              accepted: false
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  checkSubscribeRequestStatus = (followerId, userId) => {
    spikeViewApiService('getSubscriptionStatus', { userId, followerId })
      .then(response => {
        if (response.data.status === 'Success') {
          if (response.data.result.length === 0) {
            this.setState({
              subscribed: false
            });
          } else if (response.data.result[0].status === 'Subscribe') {
            console.log(response.data.result[0].subscribeId);
            this.setState({
              subscribed: true,
              subscribeId: response.data.result[0].subscribeId
            });
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  subscribeRequest = () => {
    let userId = this.state.loggedInUser;
    let followerId = this.state.userId;
    let followerName = this.state.firstName + ' ' + this.state.lastName;
    let dateTime = moment().valueOf();
    let isActive = true;
    let status = 'Subscribe';

    let data = {
      userId,
      followerId,
      followerName,
      status,
      dateTime,
      isActive
    };

    spikeViewApiService('subscribeRequest', data)
      .then(response => {
        if (response.data.status === 'Success') {
          this.checkSubscribeRequestStatus(followerId, userId);
          this.setState({
            subscribed: true
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  unsubscribeRequest = status => {
    let userId = this.state.loggedInUser;
    let followerId = this.state.userId;
    let followerName = this.state.firstName + ' ' + this.state.lastName;
    let dateTime = moment().valueOf();
    let isActive = true;
    let subscribeId = this.state.subscribeId;

    let data = {
      subscribeId,
      userId,
      followerId,
      followerName,
      status,
      dateTime,
      isActive
    };

    spikeViewApiService('unsubscribeRequest', data)
      .then(response => {
        if (response.data.status === 'Success') {
          this.checkSubscribeRequestStatus(followerId, userId);
          this.setState({
            subscribed: false
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  showRecommendationDetail = item => {
    if (item) {
      this.props.history.push({
        pathname: '/student/recommendationdetail',
        state: {
          recommendationDetail: item,
          loggedInUser: this.state.userId,
          type: 'searchProfile',
          searchUserId: this.state.userId ? this.state.userId : ''
        }
        // state: {
        //   recommendationDetail: item,
        //   searchUserId: this.state.userId ? this.state.userId : ''
        // }
      });
    }
  };

  
  imagesPopup = images => {
    console.log(images);
    this.setState({ imagesPopup: !this.state.imagesPopup });
    this.setState({
      sliderImages: images
    });
  };

  render() {
    return (
      <div className="innerWrapper">
        <div className="container" />
        {this.props.parent ? (
          <ParentHeader {...this.props} />
        ) : (
          <Header {...this.props} />
        )}

        <ToastContainer
          autoClose={5000}
          className="custom-toaster-main-cls"
          toastClassName="custom-toaster-bg"
          transition={ZoomInAndOut}
        />
        <div className="profileBox">
          <div className="banner">
            {!this.state.coverImage ? (
              <img className="bannerImg" src="" alt="" />
            ) : (
              <img className="bannerImg" src={this.state.coverImage} alt="" />
            )}
            <div className="container">
              <div className="profile-info--wrapper">
                <p className="pName">
                  {this.state.firstName} {this.state.lastName}{' '}
                </p>
                <p className="pDesc">{this.state.tagline}</p>
                {this.state.subscribed === false &&
                this.state.subscribeId === '' ? (
                  <Button
                    className="btn btn-white with-icon"
                    onClick={this.subscribeRequest}
                  >
                    <span class="icon-subscribe" />
                    Subscribe
                  </Button>
                ) : this.state.subscribed === false &&
                this.state.subscribeId !== '' ? (
                  <Button
                    className="btn btn-white with-icon"
                    onClick={this.unsubscribeRequest.bind(this, 'Subscribe')}
                  >
                    <span class="icon-subscribe" /> Subscribe
                  </Button>
                ) : (
                  <Button
                    className="btn btn-white with-icon "
                    onClick={this.unsubscribeRequest.bind(this, 'Un-Subscribe')}
                  >
                    <span class="icon-unsubscribe" /> Unsubscribe
                  </Button>
                )}
                &nbsp;
                {this.state.accepted === true ? (
                  <Link
                    to={{
                      pathname: '/student/messages/',
                      state: {
                        messageUser:
                          this.props.match &&
                          this.props.match.params &&
                          this.props.match.params.id
                      }
                    }}
                  >
                    <Button className="btn btn-white with-icon ">
                      <span class="icon-message2" />
                      Message
                    </Button>
                  </Link>
                ) : this.state.requested === false ? (
                  <Button
                    onClick={this.connectRequest}
                    className="btn white with-icon  btn-with-border"
                    disabled={this.state.disabled}
                  >
                    <span class="icon-connect" /> connect
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="btn btn-white with-icon"
                    onClick={this.cancelConnectRequest}
                  >
                    <span class="icon-cross" />
                    Cancel Request
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="container main">
            <div className="profile-sidebar">
              <div className="profile-pic--wrapper">
                <div className="profile-pic">
                  {!this.state.profileImage ? (
                    <div className="pp-default">
                      <span className="icon-user_default2" />
                    </div>
                  ) : (
                    <img src={this.state.profileImage} alt="" />
                  )}
                </div>
              </div>

              {this.state.accepted ? (
                <div className="profile-analytical--data profile-sidebar--box">
                  <div className="table-responsive  profile-analytical-table--wrapper">
                    <table className="table profile-analytical-table small mb-0">
                      <tbody>
                        <tr>
                          <td>
                            <strong>Accomplishments</strong>
                          </td>
                          <td className="tableValue">
                            {this.state.accomplishments}
                          </td>
                        </tr>
                        {/* <tr>
                        <td>
                          <strong>Endorsements</strong>
                        </td>
                        <td className="tableValue">
                          {this.state.endorsements}
                        </td>
                      </tr> */}
                        <tr>
                          <td>
                            <strong>Recommendations</strong>
                          </td>
                          <td className="tableValue">
                            {this.state.recommendations}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <SpiderChart userId={this.state.userId} sharedId="0" />
                </div>
              ) : null}
            </div>
            <div className="profileBox--mainContent">
              <ul className="myProfileInfo--wrapper">
                <StudentSummary summary={this.state.summary} />
                <StudentEducation educationData={this.state.educationData} />

                {this.state.accepted === false ? (
                  ''
                ) : (
                  <li className="myProfileInfo--item">
                    <div className="flex">
                      <div className="title--with--border">
                        <p>Create Your Story</p>
                      </div>
                    </div>

                    {this.state.achievementData &&
                    this.state.achievementData.length > 0 ? (
                      this.state.achievementData.map((data, i) => (
                        <div className="myProfileInfo--item--box" key={i}>
                          <div className="section-main">
                            <div className="flex align-center justify-content-between">
                              <div className="section-main-title with-icon">
                                <span
                                  className={`${CONSTANTS.icons[data._id]}`}
                                />
                                {data.name}
                              </div>
                            </div>
                            {data.achievement && data.achievement.length > 0
                              ? this.renderAchievement(data.achievement, data)
                              : ''}
                          </div>
                          {data.recommendation &&
                          data.recommendation.length > 0 ? (
                            <div>
                              {this.renderRecommendationsByCompetency(
                                data._id,
                                data.name,
                                data.recommendation
                              )}
                              {this.state.showRecommendationComponent ===
                              true ? (
                                <CompetencyRecommendations
                                  closeRecommendationComponent={
                                    this.showRecommendationComponent
                                  }
                                  recommandationData={
                                    this.state.recommandationData
                                  }
                                  competencyName={this.state.competencyName}
                                />
                              ) : (
                                ''
                              )}
                            </div>
                          ) : (
                            ''
                          )}

                          {data.achievement && data.achievement.length > 0 ? (
                            <div className="section-main">
                              <Row>
                                {this.renderBadges(data.achievement)}
                                {this.renderCertificates(data.achievement)}
                                {this.renderTrophies(data.achievement)}
                              </Row>
                            </div>
                          ) : (
                            ''
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="myProfileInfo--item--box">
                        <div className="content-box p-2">No data available</div>
                      </div>
                    )}
                  </li>
                )}

                {/* COMPETENCY SECTION END */}
                {this.state.accepted === false ? (
                  ''
                ) : this.state.userRecommendations &&
                this.state.userRecommendations.length > 0 ? (
                  <li className="myProfileInfo--item">
                    <div className="title--with--border">
                      <p>Recommendation</p>
                    </div>
                    <div className="myProfileInfo--item--box">
                      <Row className="show-grid">
                        {this.state.userRecommendations.slice(0, 3).map(
                          (item, index) => (
                            // index <= 2 ? (
                            <Col
                              md={4}
                              key={index}
                              onClick={this.showRecommendationDetail.bind(
                                this,
                                item
                              )}
                            >
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

                                {/* <button
                                    className="btn-link m-t-15"
                                    onClick={this.showRecommendationComponent.bind(
                                      this,
                                      item,
                                      ''
                                    )}
                                  >
                                    {item.stage}
                                  </button> */}

                                {/* <div className="helpful">
                                    <span>Helpful?</span>
                                    <span className="icon-badges icon" />
                                    <span>120</span>
                                  </div> */}
                              </div>
                            </Col>
                          )
                          // ) : (
                          //   ''
                          // )
                        )}
                      </Row>
                      <div className="text-center">
                        <button
                          className="btn btn-primary md-btn"
                          onClick={() =>
                            this.props.history.push({
                              pathname: '/student/recommendations',
                              state: {
                                loggedInUser: this.state.userId,
                                type: 'searchProfile',
                                searchUserId: this.state.userId
                                  ? this.state.userId
                                  : ''
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
              </ul>
            </div>
          </div>
        </div>
        <Modal
          bsSize="large"
          className="fullPageModal"
          show={this.state.imagesPopup}
          onHide={this.imagesPopup}
        >
          <Modal.Header closeButton>
            <Modal.Title className="subtitle text-center">
              Photos Gallery
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Slider {...photoGallery} className="slider full-page--slider">             
                    <div className="slider-item">
                      <img
                        className="img-responsive"
                        src={getThumbImage('original', this.state.sliderImages)}
                        alt=""
                      />
                    </div>                
            </Slider>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.User.userData,
    parent: state.User.parentData
  };
};

export default connect(
  mapStateToProps,
  null
)(Profile);
