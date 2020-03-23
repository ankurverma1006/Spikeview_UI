import React, { Component } from 'react';
import { connect } from 'react-redux';
import { confirmAlert } from 'react-confirm-alert';
import { Media, Button } from 'react-bootstrap';
import { Carousel } from 'react-bootstrap';
import Slider from 'react-slick';
import _ from 'lodash';
import AudioPlayer from 'react-h5-audio-player';

import ParentHeader from '../../parent/header/header';
import Header from '../header/header';
import spikeViewApiService from '../../common/core/api/apiService';
import { getThumbImage, showErrorToast } from '../../common/commonFunctions';
import CONSTANTS from '../../common/core/config/appConfig';
import SpiderChart from '../../common/spiderChart/spiderChart';
import achievementDefaultImage from '../../assets/img/default_achievement.jpg';
import StudentSummary from './studentSummary';
import StudentEducation from './studentEducation';
import StudentNarrative from './studentNarrative';
import moment from 'moment';

class PreviewProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sharedId: '',
      sharedUserId: '',
      shareConfig: '',
      sharedType: '',
      profileImage: '',
      coverImage: '',
      firstName: '',
      lastName: '',
      tagline: '',
      summary: '',
      educationData: [],
      skillList: [],
      email: '',
      profileMode: 'linear',
      index: 0,
      direction: null,
      level1Competency: [],
      achievementList: [],
      recommandationData: [],
      slideIndex: 0,
      updateCount: 0,
      audioFile: ''
    };

    this.handleSelect = this.handleSelect.bind(this);
    this.handleFirstLevelSlideChange = this.handleFirstLevelSlideChange.bind(
      this
    );
    this.setTheme = this.setTheme.bind(this);
  }

  componentWillMount() {
    let userId = this.props.parent
      ? this.props.parent.userId
      : this.props.user.userId;

    document.body.classList.add('absoluteHeader');
    document.body.classList.add('light-theme');
    this.getSharedProfileConfiguration(userId);
  }

  componentDidMount() {
    console.log('Ss');
    let _this = this;

    // _this.player.audio.load();
    // _this.player.audio.play();
  }

  setTheme = theme => {
    if (theme) {
      document.getElementById('aerialFullScreen').style.backgroundImage =
        "url('../../assets/img/thumb/large/" + theme;
    }
  };

  getSharedProfileConfiguration = userId => {
    let sharedId =
      this.props.location.state && this.props.location.state.sharedId
        ? parseInt(this.props.location.state.sharedId, 10)
        : this.props.match.params.id;

    if (sharedId) {
      spikeViewApiService('getSharedProfileConfiguration', { sharedId })
        .then(response => {
          if (response.data.status === 'Success') {
            let result = response.data.result[0];
            if (result) {
              let isActive = result.isActive;
              if (
                isActive === false &&
                (userId !== result.profileOwner || userId !== result.shareTo)
              ) {
                confirmAlert({
                  customUI: ({ onClose }) => {
                    return (
                      <div className="custom-ui">
                        <p>Your access on this profile has revoked.</p>
                        <button
                          onClick={() => {
                            onClose();
                            this.props.parent
                              ? this.props.history.push('/parent/dashboard')
                              : this.props.history.push('/student/profile');
                          }}
                        >
                          OK
                        </button>
                      </div>
                    );
                  }
                });
              } else {
                let sharedUserId = result.profileOwner;
                let shareConfig = result.shareConfiguration;
                let sharedType = result.sharedType;
                let isViewed = result.isViewed;
                let sharedView = result.sharedView;
                let theme = result.theme;
                let soundData = result.soundtrack;

                let audiofile = '';
                if (soundData.length > 0 && soundData[0].slides.length > 0) {
                  audiofile = soundData[0].slides[0].clipName;
                  if (audiofile !== '') {
                    audiofile = `${CONSTANTS.azureBlobURI}/${
                      CONSTANTS.azureContainer
                    }/${audiofile}`;
                  }
                }

                this.setTheme(theme);
                this.updateShareProfileViewed(sharedId, isViewed);
                this.getUserAchievementInfo(sharedUserId);
                this.getUserRecommendationInfo(sharedUserId);
                this.getUserPersonalInfo(sharedUserId);
                this.getUserEducationInfo(sharedUserId);
                this.getUserCount(sharedUserId, sharedId);
                this.skillCount(sharedUserId, sharedId);
                this.setState({
                  sharedUserId,
                  shareConfig,
                  sharedType,
                  sharedId,
                  sharedView,
                  soundData,
                  audioFile: audiofile
                });
              }
            }
          } else if (response.data.status === 'Error') {
            confirmAlert({
              customUI: ({ onClose }) => {
                return (
                  <div className="custom-ui">
                    <p>{response.data.message}</p>
                    <button
                      onClick={() => {
                        onClose();
                        this.props.parent
                          ? this.props.history.push('/parent/dashboard')
                          : this.props.history.push('/student/profile');
                      }}
                    >
                      OK
                    </button>
                  </div>
                );
              }
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  updateShareProfileViewed = (sharedId, isViewed) => {
    if (sharedId && isViewed === false) {
      let lastViewedTime = moment().valueOf();
      let isViewed = true;
      let data = {
        sharedId,
        isViewed,
        lastViewedTime
      };
      spikeViewApiService('isShareProfileViewed', data);
    }
  };

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
            let email = userData.email;
            this.setState({
              profileImage,
              coverImage,
              firstName,
              lastName,
              tagline,
              summary,
              userData,
              email
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

  getUserCount(userId, sharedId) {
    if ((userId, sharedId)) {
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

  getUserAchievementInfo = userId => {
    if (userId) {
      spikeViewApiService('listAchievementByUser1', { userId })
        .then(response => {
          if (response.data.status === 'Success') {
            this.setState({ achievementData: response.data.result }, () => {
              if (this.state.sharedView === 'aerial') this.setCompetencyData();
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  skillCount = (userId, sharedId) => {
    if (sharedId && userId) {
      spikeViewApiService('getSkillsCount', { userId, sharedId })
        .then(response => {
          if (response && response.data.status === 'Success') {
            this.setState({
              skillList: response.data.result
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  handleProfileView = event => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    if (value === 'aerial') {
      this.setCompetencyData();
    }
    this.setState({
      [name]: value
    });
  };

  handleSelect(selectedIndex, e) {
    let { soundData } = this.state;
    let audiofile = '';

    if (soundData.length > 0 && soundData[0].type === CONSTANTS.multipleTrack) {
      let slide = soundData[0].slides[selectedIndex].slideName;
      audiofile = soundData[0].slides[selectedIndex].clipName;
      if (audiofile !== '') {
        audiofile = `${CONSTANTS.azureBlobURI}/${
          CONSTANTS.azureContainer
        }/${audiofile}`;
      }
      this.setState(
        {
          index: selectedIndex,
          direction: e.direction,
          audioFile: audiofile
        },
        () => {
          this.player.audio.pause();
          this.player.audio.load();
          this.player.audio.play();
        }
      );
    } else {
      this.setState({
        index: selectedIndex,
        direction: e.direction
      });
    }
  }

  handleSlideChange = slideIndex => {
    this.setState({
      index: slideIndex,
      direction: slideIndex <= this.state.index ? 'prev' : 'next'
    });
  };

  setCompetencyData = () => {
    let achievementData = this.state.achievementData;
    let shareConfig = this.state.shareConfig;
    let finalAchievementData = [];
    let sortedAchievement = [];

    var achievemenList = [];
    var secondLevel = [];
    var _achievementData = [];

    for (let index = 0; index < achievementData.length; index++) {
      let data = achievementData[index];
      sortedAchievement = [];
      for (let i = 0; i < shareConfig.length; i++) {
        let config = shareConfig[i];
        if (data._id === config.competencyTypeId && config.importance <= 12) {
          for (let j = 0; j < data.achievement.length; j++) {
            let element = data.achievement[j];
            if (element.importance >= config.importance) {
              sortedAchievement.push(element);
            }
          }
          data.achievement = sortedAchievement;
          finalAchievementData.push(data);
        }
      }
    }

    var level1Competency = _.uniq(_.map(finalAchievementData, 'level1'));

    for (let index = 0; index < finalAchievementData.length; index++) {
      let data = finalAchievementData[index];
      if (data.achievement.length > 0) {
        achievemenList.push({ level1: data.level1 });
      }
    }

    achievemenList = _.uniqBy(achievemenList, function(p) {
      return p.level1;
    });

    for (var index1 = 0; index1 < achievemenList.length; index1++) {
      var element1 = achievemenList[index1];
      secondLevel = [];
      _achievementData = [];
      for (var index2 = 0; index2 < finalAchievementData.length; index2++) {
        var element2 = finalAchievementData[index2];
        if (element1.level1 === element2.level1) {
          if (element2.achievement.length > 0) {
            secondLevel.push({ level2: element2.name, id: element2._id });
            for (
              var index3 = 0;
              index3 < element2.achievement.length;
              index3++
            ) {
              _achievementData.push(element2.achievement[index3]);
            }
            achievemenList[index1]['level2'] = secondLevel;
            achievemenList[index1]['achievement'] = _achievementData;
          }
        }
      }
    }

    this.setState({
      level1Competency,
      level2Competency: achievemenList
    });
  };

  handleFirstLevelSlideChange = (iterationIndex, level1) => {
    let wholeAchievementData = this.state.level2Competency;
    let achievementLength = 0;
    if (iterationIndex === 0) {
      this.setState({
        index: this.state.index + 1,
        direction: 'next'
      });
    } else {
      for (var i = 0; i < iterationIndex; i++) {
        achievementLength =
          achievementLength + wholeAchievementData[i].achievement.length + 2;
      }

      this.setState({
        index: this.state.index + achievementLength + 1,
        direction: 'next'
      });
    }
  };

  handleSecondLevelSlideChange = (level1, iterationIndex, competencyName) => {
    let wholeAchievementData = this.state.level2Competency;
    let clickedCompetencyData = _.filter(wholeAchievementData, function(o) {
      return o.level1 === level1;
    });

    if (iterationIndex === 0) {
      this.setState({
        index: this.state.index + 2,
        direction: 'next'
      });
    } else {
      let competencyIndex = _.findIndex(
        clickedCompetencyData[0].achievement,
        function(o) {
          return o.level2Competency === competencyName;
        }
      );

      this.setState({
        index: this.state.index + competencyIndex + 2,
        direction: 'next'
      });
    }
  };

  handleThirdLevelSlideChange = iterationIndex => {
    let totalIndex = 1;
    if (iterationIndex === 0) {
      this.setState({
        index: this.state.index + 1,
        direction: 'next'
      });
    } else {
      for (var i = 0; i < iterationIndex; i++) {
        totalIndex = totalIndex + i;
      }
      this.setState({
        index: this.state.index + totalIndex + 1,
        direction: 'next'
      });
    }
  };

  handleBackSlide = iterationIndex => {
    this.setState({
      index: this.state.index - (iterationIndex + 1),
      direction: 'prev'
    });
  };

  getUserRecommendationInfo = userId => {
    spikeViewApiService('listRecommendationByUser', { userId })
      .then(response => {
        if (response.data.status === 'Success') {
          let recommandationData = response.data.result;
          if (recommandationData.length > 0) {
            recommandationData = _.filter(recommandationData, {
              stage: 'Added'
            });
          }

          this.setState({
            recommandationData: recommandationData
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  navigateToMedia = iterationIndex => {
    console.log(iterationIndex);
  };

  renderMedia = mediaData => {
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
    return <img className="img-responsive" src={imgSource} alt="" />;
  };

  openFullscreen = () => {
    var elem = document.getElementById('aerialFullScreen');
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE/Edge */
      elem.msRequestFullscreen();
    }
  };

  render() {
    let _this = this;
    const { index, direction, recommandationData } = this.state;
    var settings = {
      dots: false,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      swipeToSlide: true,
      nextArrow: false,
      prevArrow: false,
      centerMode: true,
      centerPadding: '150px'
    };

    const sliderWithThumbnails = {
      autoplay: true,
      dots: true,
      dotsClass: 'slick-dots slick-thumb',
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1
    };

    const verticalSlider = {
      dots: false,
      autoplay: true,
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      vertical: true,
      verticalSwiping: true,
      nextArrow: false,
      prevArrow: false
    };

    if (this.state.sharedView === 'linear') {
      document.body.classList.add('absoluteHeader');
      document.body.classList.remove('home');
      document.body.classList.remove('fixedHeader');
      document.body.classList.remove('sharedView');
    } else {
      document.body.classList.add('home');
      document.body.classList.add('fixedHeader');
      document.body.classList.add('sharedView');
      document.body.classList.remove('absoluteHeader');
    }

    return (
      <div
        className={`innerWrapper ${
          _this.state.sharedView === 'aerial' ? 'height--100' : ''
        }`}
      >
        {this.props.parent ? (
          <ParentHeader {..._this.props} />
        ) : (
          <Header {..._this.props} />
        )}

        {_this.state.sharedView === 'linear' ? (
          <div className="profileBox">
            <div className="banner">
              {!this.state.coverImage ? (
                <img className="bannerImg" src="" alt="" />
              ) : (
                <img
                  className="bannerImg"
                  src={_this.state.coverImage}
                  alt=""
                />
              )}
              <div className="container">
                <div className="profile-info--wrapper">
                  <p className="pName">
                    {this.state.firstName} {this.state.lastName}
                  </p>
                  <p className="pDesc">{this.state.tagline}</p>
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

                  <SpiderChart
                    userId={this.state.sharedUserId}
                    sharedId={this.state.sharedId}
                  />
                </div>
                {this.state.skillList && this.state.skillList.length > 0 ? (
                  <div className="postWrapper">
                    <div className="pw-postHeader md-size">
                      <div className="sectionTitle">Skills</div>
                    </div>
                    <div className="pw-postBody">
                      <div className="table-responsive">
                        <table className="table profile-analytical-table small mb-0">
                          <tbody>
                            {this.state.skillList.map(
                              (skill, index) =>
                                skill.count > 0 ? (
                                  <tr key={skill.skillId}>
                                    <td>{skill.title}</td>
                                    <td className="tableValue">
                                      {skill.count}
                                    </td>
                                  </tr>
                                ) : (
                                  ''
                                )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  ''
                )}
              </div>
              <div className="profileBox--mainContent">
                <ul className="myProfileInfo--wrapper">
                  <StudentSummary summary={this.state.summary} />

                  <StudentEducation educationData={this.state.educationData} />

                  {this.state.sharedUserId ? (
                    <StudentNarrative
                      sharedUserId={this.state.sharedUserId}
                      shareConfig={this.state.shareConfig}
                      achievementData={this.state.achievementData}
                      {...this.props}
                    />
                  ) : (
                    ''
                  )}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="container main home--innerWrapper height--100">
            <div className="profileBox--mainContent shareProfileShared">
              {_this.state.sharedView === 'aerial' ? (
                <Button
                  onClick={this.openFullscreen.bind(this)}
                  bsStyle="link"
                  className="m-t-15 text-uppercase"
                >
                  <img
                    src="../../../assets/img/full_page_view.svg"
                    width="40px"
                    alt=""
                  />{' '}
                  Fullscreen Mode
                </Button>
              ) : (
                ''
              )}
              <div
                className=" profile-achievement-ariel-view"
                id="aerialFullScreen"
              >
                <AudioPlayer
                  hidePlayer={true}
                  autoPlay={true}
                  src={this.state.audioFile}
                  loop={true}
                  preload="auto"
                  ref={c => (this.player = c)}
                />

                <div id="myCarousel" className="carousel slide animatedSlider">
                  <Carousel
                    activeIndex={index}
                    direction={direction}
                    onSelect={this.handleSelect}
                    interval={500000}
                    slide={false}
                    indicators={false}
                    nextIcon={<span className="icon-right_carousel" />}
                    prevIcon={<span className="icon-left_carousel" />}
                  >
                    <Carousel.Item>
                      <div className="fill centered-box">
                        <div className="fillBg">
                          <span className="randomBGlines" />
                        </div>
                        <div className="user-profile">
                          <Media className="school-info--wrapper">
                            <Media.Left className="animated rollIn">
                              {!this.state.profileImage ? (
                                <span className="icon-user_default2 pp-default" />
                              ) : (
                                <img
                                  className="object-fit-cover"
                                  src={this.state.profileImage}
                                  alt=""
                                />
                              )}
                            </Media.Left>
                            <Media.Body className="animated fadeInDown">
                              <Media.Heading className="s--name">
                                {this.state.firstName} {this.state.lastName}
                              </Media.Heading>
                              <p className="s--duration">{this.state.email}</p>
                              <p className="s--summary">{this.state.summary}</p>
                            </Media.Body>
                          </Media>
                        </div>
                      </div>
                    </Carousel.Item>

                    <Carousel.Item>
                      <div className="fill centered-box">
                        <div className="fillBg">
                          <span className="randomBGlines" />
                        </div>
                        <div className="second-fold--inner">
                          <ul className="up--links animated fadeInLeft">
                            <li>
                              <a onClick={this.handleSlideChange.bind(this, 0)}>
                                Summary
                              </a>
                            </li>
                            <li>
                              <a onClick={this.handleSlideChange.bind(this, 2)}>
                                Education
                              </a>
                            </li>
                            {this.state.level2Competency &&
                            this.state.level2Competency.length > 0 ? (
                              <li>
                                <a
                                  onClick={this.handleSlideChange.bind(this, 3)}
                                >
                                  Narrative
                                </a>
                              </li>
                            ) : (
                              ''
                            )}
                          </ul>

                          <div className="up--graph animated fadeInRight">
                            <SpiderChart
                              userId={_this.state.sharedUserId}
                              sharedId="0"
                              type="aerial"
                            />
                          </div>
                        </div>
                      </div>
                    </Carousel.Item>

                    <Carousel.Item>
                      <div className="fill">
                        <h2 className="animated fadeInRight text-center">
                          Education
                        </h2>
                        <div className="educationSlider ">
                          <Slider
                            {...settings}
                            className="slider partial-view--slider"
                          >
                            {this.state.educationData &&
                            this.state.educationData.length > 0 ? (
                              this.state.educationData.map(
                                (data, educationIndex) => (
                                  <div
                                    className="slider-item"
                                    key={educationIndex}
                                  >
                                    <Media className="school-info--wrapper">
                                      <Media.Left className="animated rollIn">
                                        {data.logo !== '' ? (
                                          <img
                                            src={getThumbImage(
                                              'medium',
                                              data.logo
                                            )}
                                            alt=""
                                          />
                                        ) : (
                                          <span className="icon-school icon lg-icon" />
                                        )}
                                      </Media.Left>
                                      <Media.Body className="animated fadeInDown">
                                        <Media.Heading className="s--name">
                                          {data.institute}
                                        </Media.Heading>
                                        <p className="s--duration">
                                          {data.fromGrade} to {data.toGrade}{' '}
                                          <span className="s--year">
                                            {data.fromYear} to {data.toYear}{' '}
                                          </span>
                                        </p>
                                        <p className="s--summary">
                                          {data.description}
                                        </p>
                                      </Media.Body>
                                    </Media>
                                  </div>
                                )
                              )
                            ) : (
                              <div className="slider-item">
                                No Data Available
                              </div>
                            )}
                          </Slider>
                        </div>
                      </div>
                    </Carousel.Item>

                    {this.state.level2Competency &&
                    this.state.level2Competency.length > 0 ? (
                      <Carousel.Item>
                        <div className="fill">
                          <h2 className="animated fadeInRight text-center">
                            My Narrative
                          </h2>
                          <ul className="circular-links floatingCircle">
                            {this.state.level2Competency.map(
                              (item, indexLevel) => (
                                <li
                                  className="animated rollIn"
                                  key={indexLevel}
                                >
                                  {item.level1 === 'Academic Competency' ? (
                                    <a
                                      onClick={_this.handleFirstLevelSlideChange.bind(
                                        _this,
                                        indexLevel,
                                        item.level1
                                      )}
                                    >
                                      <span className="icon-academic c--icon" />
                                      <span className="c--title">Academic</span>
                                    </a>
                                  ) : item.level1 === 'Sports Competency' ? (
                                    <a
                                      onClick={_this.handleFirstLevelSlideChange.bind(
                                        _this,
                                        indexLevel,
                                        item.level1
                                      )}
                                    >
                                      <span className="icon-sports c--icon" />
                                      <span className="c--title">Sports</span>
                                    </a>
                                  ) : item.level1 === 'Arts Competency' ? (
                                    <a
                                      onClick={_this.handleFirstLevelSlideChange.bind(
                                        _this,
                                        indexLevel,
                                        item.level1
                                      )}
                                    >
                                      <span className="icon-arts c--icon" />
                                      <span className="c--title">Arts</span>
                                    </a>
                                  ) : item.level1 ===
                                  'Vocational Competency' ? (
                                    <a
                                      onClick={_this.handleFirstLevelSlideChange.bind(
                                        _this,
                                        indexLevel,
                                        item.level1
                                      )}
                                    >
                                      <span className="icon-vocational c--icon" />
                                      <span className="c--title">
                                        Vocational
                                      </span>
                                    </a>
                                  ) : (
                                    ''
                                  )}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </Carousel.Item>
                    ) : (
                      ''
                    )}

                    {_this.state.level2Competency &&
                    _this.state.level2Competency.length > 0
                      ? _this.state.level2Competency.map(function(
                          level2,
                          index1
                        ) {
                          return [
                            level2.achievement.length > 0 ? (
                              <Carousel.Item>
                                <div className="fill">
                                  <div className="fillBg">
                                    <span className="icon-sports bgIcon" />
                                  </div>

                                  <ul className="fold--links">
                                    <li>
                                      <a>Narrative</a>
                                    </li>

                                    <li className="active">
                                      <a>{level2.level1}</a>
                                    </li>
                                  </ul>

                                  <ul className="circular-links">
                                    {level2.level2.map((item, index2) => (
                                      <li
                                        className="animated rollIn"
                                        key={item.id}
                                      >
                                        <a
                                          onClick={_this.handleSecondLevelSlideChange.bind(
                                            _this,
                                            level2.level1,
                                            index2,
                                            item.level2
                                          )}
                                        >
                                          <span
                                            className={`c--icon ${
                                              CONSTANTS.icons[item.id]
                                            }`}
                                          />
                                          <span className="c--title">
                                            {item.level2}
                                          </span>
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </Carousel.Item>
                            ) : (
                              ''
                            ),
                            level2.achievement.length > 0 ? (
                              <Carousel.Item>
                                <div className="fill">
                                  <h2 className="animated fadeInDown text-center absolute">
                                    {' '}
                                    Achievement
                                  </h2>
                                  <div className="acivementsWrapper flex-1">
                                    <div className="aw--content animated fadeInLeft">
                                      {recommandationData &&
                                      recommandationData.length > 1 ? (
                                        <Slider {...verticalSlider}>
                                          {recommandationData.map(
                                            (user, index4) => (
                                              <div
                                                className="slider-item"
                                                key={index4}
                                              >
                                                <div className="aw--userDetails">
                                                  <div className="aw--userIcon">
                                                    {user.recommender
                                                      .profilePicture ? (
                                                      <img
                                                        className="object-fit-cover"
                                                        src={getThumbImage(
                                                          'small',
                                                          user.recommender
                                                            .profilePicture
                                                        )}
                                                        alt=""
                                                      />
                                                    ) : (
                                                      <span className="icon-user_default2" />
                                                    )}
                                                  </div>
                                                  <div className="aw--userName">
                                                    {user.recommender.firstName}{' '}
                                                    &nbsp;
                                                    {user.recommender.lastName}
                                                  </div>
                                                  <div className="aw--userDesig">
                                                    {user.recommender.title}
                                                  </div>
                                                  <div className="aw--userDesc">
                                                    {user.recommendation}
                                                  </div>
                                                </div>
                                              </div>
                                            )
                                          )}
                                        </Slider>
                                      ) : recommandationData &&
                                      recommandationData.length === 1 ? (
                                        recommandationData.map(
                                          (user, index5) => (
                                            <div
                                              className="slider-item"
                                              key={index5}
                                            >
                                              <div className="aw--userDetails">
                                                <div className="aw--userIcon">
                                                  {user.recommender
                                                    .profilePicture ? (
                                                    <img
                                                      className="object-fit-cover"
                                                      src={getThumbImage(
                                                        'small',
                                                        user.recommender
                                                          .profilePicture
                                                      )}
                                                      alt=""
                                                    />
                                                  ) : (
                                                    <span className="icon-user_default2" />
                                                  )}
                                                </div>
                                                <div className="aw--userName">
                                                  {user.recommender.firstName}{' '}
                                                  &nbsp;
                                                  {user.recommender.lastName}
                                                </div>
                                                <div className="aw--userDesig">
                                                  {user.recommender.title}
                                                </div>
                                                <div className="aw--userDesc">
                                                  {user.recommendation}
                                                </div>
                                              </div>
                                            </div>
                                          )
                                        )
                                      ) : (
                                        ''
                                      )}
                                    </div>

                                    <div className="aw--carousel partial-view--slider achievement-slider animated fadeInRight">
                                      <Slider {...settings}>
                                        {level2.achievement.map(
                                          (image, index5) => (
                                            <div
                                              className="slider-item"
                                              key={index5}
                                              onClick={_this.handleThirdLevelSlideChange.bind(
                                                _this,
                                                index5
                                              )}
                                            >
                                              <a>
                                                <span className="image-section">
                                                  {_this.renderMedia(
                                                    image.asset
                                                  )}
                                                </span>
                                                <span className="image-section-title">
                                                  {image.title}
                                                </span>
                                              </a>
                                            </div>
                                          )
                                        )}
                                      </Slider>
                                    </div>
                                  </div>
                                </div>
                              </Carousel.Item>
                            ) : (
                              ''
                            ),

                            level2.achievement && level2.achievement.length > 0
                              ? level2.achievement.map(function(data, index3) {
                                  return [
                                    <Carousel.Item>
                                      <div
                                        className="fill with-space pr-0"
                                        id="certifiatesSlider"
                                      >
                                        <div className="halfGrid" />
                                        <div className="withBackArrow">
                                          <a
                                            className="animated fadeInUp"
                                            onClick={_this.handleBackSlide.bind(
                                              _this,
                                              index3
                                            )}
                                          >
                                            <span className="icon-back_arrow2" />
                                          </a>
                                          <h2 className="animated fadeInDown text-center">
                                            {' '}
                                            {data.title}
                                          </h2>
                                        </div>
                                        <div className="acivementsWrapper flex-1">
                                          <div className="aw--carousel animated fadeInLeft">
                                            {data.asset &&
                                            data.asset.length > 0 ? (
                                              <Slider {...sliderWithThumbnails}>
                                                {data.asset.map(
                                                  (asset, row) => (
                                                    <div
                                                      className="slider-item"
                                                      key={row}
                                                    >
                                                      <img
                                                        className="img-responsive"
                                                        src={`${
                                                          CONSTANTS.azureBlobURI
                                                        }/${
                                                          CONSTANTS.azureContainer
                                                        }/${asset.file}`}
                                                        alt="asset"
                                                      />
                                                    </div>
                                                  )
                                                )}
                                              </Slider>
                                            ) : (
                                              <img
                                                className="img-responsive"
                                                src={achievementDefaultImage}
                                                alt=""
                                              />
                                            )}
                                          </div>
                                          <div className="aw--content pr-0 scrollableMedia animated fadeInRight">
                                            <div className="achievement-title">
                                              <span className="icon-business" />
                                              <div className="at--title">
                                                {data.level2Competency}
                                              </div>
                                            </div>
                                            <div className="at--desc">
                                              {data.description}
                                            </div>
                                            <h4>Media Gallery</h4>
                                            <ul className="mediaGallery 2-columns">
                                              {data.asset &&
                                              data.asset.length > 0
                                                ? data.asset.map(
                                                    (asset, row) => (
                                                      <li
                                                        key={row}
                                                        // onClick={_this.navigateToMedia.bind(
                                                        //   _this,
                                                        //   row
                                                        // )}
                                                      >
                                                        <a>
                                                          <img
                                                            className="object-fit-cover"
                                                            src={`${
                                                              CONSTANTS.azureBlobURI
                                                            }/${
                                                              CONSTANTS.azureContainer
                                                            }/${asset.file}`}
                                                            alt="asset"
                                                          />
                                                        </a>
                                                      </li>
                                                    )
                                                  )
                                                : data.badge &&
                                                  data.badge.length > 0
                                                  ? data.badge.map(
                                                      (badge, row1) => (
                                                        <li key={row1}>
                                                          <a>
                                                            <img
                                                              className="object-fit-cover"
                                                              src={`${
                                                                CONSTANTS.azureBlobURI
                                                              }/${
                                                                CONSTANTS.azureContainer
                                                              }/${badge.file}`}
                                                              alt="badge"
                                                            />
                                                          </a>
                                                        </li>
                                                      )
                                                    )
                                                  : data.certificate &&
                                                    data.certificate.length > 0
                                                    ? data.certificate.map(
                                                        (certificate, row2) => (
                                                          <li key={row2}>
                                                            <a>
                                                              <img
                                                                className="object-fit-cover"
                                                                src={`${
                                                                  CONSTANTS.azureBlobURI
                                                                }/${
                                                                  CONSTANTS.azureContainer
                                                                }/${
                                                                  certificate.file
                                                                }`}
                                                                alt="certificate"
                                                              />
                                                            </a>
                                                          </li>
                                                        )
                                                      )
                                                    : ''}
                                            </ul>
                                          </div>
                                        </div>
                                      </div>
                                    </Carousel.Item>
                                  ];
                                })
                              : ''
                          ];
                        })
                      : ''}
                  </Carousel>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* <div className="fixed--controls bottom animated slideInUp">
          <ul className="viewChanger">
            <li>
              <input
                type="radio"
                name="profileMode"
                value="linear"
                checked={this.state.profileMode === 'linear' ? true : false}
                onChange={this.handleProfileView}
              />
              <label className="radio-inline linear">
                <span className="icon-linear_view icon" />
                Linear View
              </label>
            </li>

            <li>
              <input
                type="radio"
                name="profileMode"
                value="aerial"
                checked={this.state.profileMode === 'aerial' ? true : false}
                onChange={this.handleProfileView}
              />
              <label className="radio-inline aerial">
                <span className="icon-aerial_view icon" />
                Aerial View
              </label>
            </li>
          </ul>
        </div> */}
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
)(PreviewProfile);
