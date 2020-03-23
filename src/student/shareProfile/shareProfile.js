import React, { Component } from 'react';
import {
  FormGroup,
  FormControl,
  Button,
  DropdownButton,
  MenuItem,
  Col,
  Row,
  Modal,
  ControlLabel,
  Form,
  Glyphicon
} from 'react-bootstrap';
import { connect } from 'react-redux';
import Slider from 'react-slick';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import validation from 'react-validation-mixin';
import strategy from 'react-validatorjs-strategy';
import classnames from 'classnames';
import moment from 'moment';
import { ToastContainer } from 'react-toastify';
import RangeSlider from 'react-rangeslider';

import Header from '../header/header';
import CONSTANTS from '../../common/core/config/appConfig';
import spikeViewApiService from '../../common/core/api/apiService';
import CompetencyRecommendations from '../profile/competency/recommendations/competencyWiseRecommendations';
import {
  ZoomInAndOut,
  showSuccessToast,
  limitCharacter,
  SampleNextArrow,
  SamplePrevArrow,
  renderMessage,
  getThumbImage
} from '../../common/commonFunctions';
import achievementDefaultImage from '../../assets/img/default_achievement.jpg';
import StudentSummary from '../previewSharedProfile/studentSummary';
import StudentEducation from '../previewSharedProfile/studentEducation';
import ShareAerialProfile from './ShareAerialProfile';

let validationMessages = CONSTANTS.validationMessages;
let regExpressions = CONSTANTS.regExpressions;

var filteredAchievementList = [];
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

class ShareProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: '',
      firstName: '',
      lastName: '',
      summary: '',
      email: '',
      profileImage: '',
      educationData: [],
      competencyList: [],
      value: 10,
      filteredAchievementList: [],
      achievementData: [],
      sliderCompetencyName: {},
      shareEmailModal: false,
      isLoading: false,
      profileView: 'linear',
      userData: '',
      themes: [
        '1.jpg',
        '2.jpg',
        '3.jpg',
        '4.jpg',
        '5.jpg',
        '6.jpg',
        '7.jpg',
        '8.jpg'
      ],
      soundTrack: []
    };

    this.filterCompetencyData = this.filterCompetencyData.bind(this);
    this.getValidatorData = this.getValidatorData.bind(this);
    this.getClasses = this.getClasses.bind(this);

    this.validatorTypes = strategy.createInactiveSchema(
      {
        shareFirstName: ['required', 'regex:' + regExpressions.alphaOnly],
        shareLastName: ['required', 'regex:' + regExpressions.alphaOnly],
        shareEmail: 'required|email'
      },
      {
        'required.shareFirstName': validationMessages.firstName.required,
        'regex.shareFirstName': validationMessages.firstName.alphaOnly,
        'required.shareLastName': validationMessages.lastName.required,
        'regex.shareLastName': validationMessages.lastName.alphaOnly,
        'required.shareEmail': validationMessages.email.required,
        'email.shareEmail': validationMessages.email.invalid
      }
    );
  }

  componentWillMount() {
    document.body.classList.add('light-theme');
    document.body.classList.add('home');
    document.body.classList.add('fixedHeader');
    this.getAllImportance();
  }

  componentDidMount() {
    if (this.props.user) {
      let _this = this;
      setTimeout(function() {
        _this.getUserAchievementInfo(_this.props.user.userId);
      }, 500);

      this.setUserInfo(this.props.user);
      this.getUserEducationInfo(this.props.user.userId);
      this.getUserRecommendationInfo(this.props.user.userId);
    }

    let sidebarHeight = this.sideBar.clientHeight;
    console.log(sidebarHeight);
    if (sidebarHeight < 500) {
      document.querySelector('.sidebarFixed').classList.add('fixed-sidebar');
    }
  }

  componentWillReceiveProps(res) {
    this.getUserAchievementInfo(this.props.user.userId);
    this.setUserInfo(res.user);
    this.getUserEducationInfo(this.props.user.userId);
    this.getUserRecommendationInfo(this.props.user.userId);
  }

  showRecommendationComponent = (recommandationData, competencyName) => {
    this.setState({
      showRecommendationComponent: !this.state.showRecommendationComponent,
      recommandationData,
      competencyName
    });
  };

  getAllImportance() {
    spikeViewApiService('getImportance')
      .then(response => {
        if (response.data.status === 'Success') {
          this.setState({ importanceList: response.data.result });
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  selectedTheme = theme => {
    this.setState({
      selectedTheme: theme
    });
  };

  setUserInfo = data => {
    if (data) {
      let userId = data.userId;
      let summary = data.summary;
      let firstName = data.firstName;
      let lastName = data.lastName;
      let email = data.email;
      let profileImage = data.profilePicture;
      if (profileImage) {
        profileImage = getThumbImage('medium', profileImage);
      }
      this.setState({
        userData: data,
        summary,
        firstName,
        lastName,
        userId,
        email,
        profileImage
      });
    }
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
    spikeViewApiService('listAchievementByUser1', { userId })
      .then(response => {
        if (response.data.status === 'Success') {
          let achievementData = response.data.result;
          if (achievementData.length > 0) {
            let competencyList = [];
            achievementData.map((data, index) => {
              let minImportance = _.minBy(data.achievement, function(o) {
                return o.importance;
              });

              competencyList.push({
                competencyId: data._id,
                name: data.name,
                importance: minImportance.importance
              });

              let _importanceLevel = _.filter(this.state.importanceList, {
                importanceId: minImportance.importance
              });

              if (_importanceLevel.length > 0) {
                this.setState({
                  ['RangeSliderImportance' + index]: _importanceLevel[0].title,
                  ['RangeSliderValue' + index]: minImportance.importance
                });
              }
            });
            this.setState({
              achievementData,
              filteredAchievementList: achievementData,
              competencyList
            });
          }
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
                {this.renderMedia(achievement.asset)}
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
                {limitCharacter(achievement.title, 95)}
              </span>
            </a>
          </div>
        ))}
      </Slider>
    );
  };

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
          item.asset.map((badge, index) => {           
            badge.tag === CONSTANTS.trophieAlbum
              ? trophyArray.push({ trophy: badge.file, title: item.title })
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
                          alt="Trophy"                         
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

  renderRecommendationsByCompetency(competencyId, competencyName) {
    let recommandations = this.state.recommandationData;
    if (recommandations && recommandations.length > 0) {
      recommandations = _.filter(recommandations, {
        competencyTypeId: competencyId,
        stage: 'Added'
      });
    }

    return (
      <div>
        {recommandations && recommandations.length > 0 ? (
          <div className="section-main card">
            <div className="flex align-center justify-content-between">
              <div className="section-main-title with-icon">
                <span className="icon-recommandations icon" />
                Recommendations for &nbsp;
                {competencyName} <span>({recommandations.length})</span>
              </div>
              {recommandations.length > 3 ? (
                <a
                  onClick={this.showRecommendationComponent.bind(
                    this,
                    recommandations,
                    competencyName
                  )}
                  style={{ cursor: 'pointer' }}
                >
                  See All
                </a>
              ) : (
                ''
              )}
            </div>

            <ul className="flex flex-list--row testimonials">
              {recommandations.map(
                (recommandation, index) =>
                  index <= 2 && recommandation.stage === 'Added' ? (
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
                            {limitCharacter(recommandation.recommendation, 85)}
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

  filterCompetencyData(sliderIndex, competencyName, sliderValue) {
    // this.setState({
    //   filteredAchievementList: []
    // });

    var foundAchieventList = [];
    let _achievementData = JSON.parse(
      JSON.stringify(this.state.achievementData)
    ); // [...this.state.achievementData];

    console.log('sliderValue -- ' + sliderValue);
    console.log('Actual achievementData', _achievementData);

    if (_achievementData.length > 0) {
      for (let index = 0; index < _achievementData.length; index++) {
        let data = JSON.parse(JSON.stringify(_achievementData[index]));
        if (data.name === competencyName) {
          for (var index1 = 0; index1 < data.achievement.length; index1++) {
            var element1 = data.achievement[index1];
            if (element1.importance >= sliderValue) {
              foundAchieventList.push(element1);
            }
          }
          console.log(foundAchieventList);
        }
      }
    }

    let filterIndexOnView = _.findIndex(_achievementData, o => {
      if (o.name === competencyName) {
        return true;
      }
      return false;
    });

    if (filterIndexOnView !== -1) {
      if (filteredAchievementList.length !== 0) {
        console.log('check for found list', foundAchieventList);
        filteredAchievementList[
          filterIndexOnView
        ].achievement = foundAchieventList;
      } else {
        _achievementData[filterIndexOnView].achievement = foundAchieventList;
        filteredAchievementList = JSON.parse(JSON.stringify(_achievementData));
      }
    }
    console.log(filteredAchievementList);
    this.setState({
      filteredAchievementList: filteredAchievementList
    });
  }

  handleChangeComplete = async (
    e,
    sliderIndex,
    competencyName,
    sliderValue
  ) => {
    let filteredData = this.state.filteredAchievementList;
    if (filteredData.length > 0) {
      for (let i = 0; i < this.state.competencyList.length; i++) {
        let _competencyName = this.state.competencyList[i].name;
        let _sliderValue = this.state['RangeSliderValue' + i];

        this.filterCompetencyData(sliderIndex, _competencyName, _sliderValue);
      }
    }
  };

  handleChange = (sliderIndex, competencyName, sliderValue, e) => {
    let _importanceLevel = _.filter(this.state.importanceList, {
      importanceId: sliderValue
    });

    if (_importanceLevel.length > 0) {
      this.filterCompetencyData(sliderIndex, competencyName, sliderValue);
      this.setState({
        ['RangeSliderValue' + sliderIndex]: sliderValue,
        ['RangeSliderImportance' + sliderIndex]: _importanceLevel[0].title
      });
    } else {
      this.filterCompetencyData(sliderIndex, competencyName, sliderValue);
      this.setState({
        ['RangeSliderValue' + sliderIndex]: CONSTANTS.rangeSliderHideValue,
        ['RangeSliderImportance' + sliderIndex]: CONSTANTS.rangeSliderHideName
      });
    }
  };

  shareProfile = sharingType => {
    if (sharingType) {
      let _this = this;
      let sharedType = sharingType;
      let profileOwner = this.props.user.userId
        ? this.props.user.userId
        : this.state.userId;
      let shareTime = moment().valueOf();
      let sharedView = this.state.profileView;
      let isActive = this.props.user.isActive;
      let competencyData = this.state.competencyList;
      let theme = this.state.selectedTheme;
      let shareConfiguration = [];
      if (competencyData.length > 0) {
        competencyData.map((data, index) =>
          shareConfiguration.push({
            competencyTypeId: data.competencyId,
            importance: this.state['RangeSliderValue' + index]
          })
        );
      }
      let soundtrack = this.state.soundTrack;

      if (sharingType === 'Message') {
        let data = {
          sharedType,
          profileOwner,
          shareTime,
          shareConfiguration,
          sharedView,
          isActive,
          theme,
          soundtrack
        };

        spikeViewApiService('shareStudentProfile', data)
          .then(response => {
            if (response.data.status === 'Success') {
              let shareId = response.data.result.sharedId;
              let shareLink = response.data.result.link;
              if (sharedType === 'Message') {
                _this.props.history.push({
                  pathname: this.props.parent
                    ? '/parent/messaging'
                    : '/student/messages',
                  //pathname: '/student/messages',
                  state: {
                    profileShare: 1,
                    shareId: shareId,
                    shareLink: shareLink
                  }
                });
              }
            }
          })
          .catch(err => {
            console.log(err);
          });
      }

      if (sharingType === 'Email') {
        this.setState({
          shareEmailModal: true
        });
      }
    }
  };

  shareEmailModal = () => {
    this.setState({
      shareEmailModal: !this.state.shareEmailModal,
      shareFirstName: '',
      shareLastName: '',
      shareEmail: ''
    });
    this.props.clearValidations();
  };

  getValidatorData = () => {
    return this.state;
  };

  getClasses = field => {
    return classnames({
      error: !this.props.isValid(field)
    });
  };

  submitData = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.validateData();
    }
  };

  validateData = () => {
    let self = this;
    this.props.validate(function(error) {
      if (!error) {
        self.setState({ isLoading: true });
        self.handleSubmit();
      }
    });
  };

  handleSoundTrack = data => {
    let soundTrackArr = [];
    let slides = [];
    if (data) {
      slides.push({
        slideName: 'slide',
        clipName: data
      });
      console.log(slides);
      soundTrackArr.push({
        slides: slides,
        type: 'single'
      });

      this.setState({
        soundTrack: soundTrackArr
      });
    }
  };

  handleSubmit = event => {
    let _this = this;
    let sharedType = 'Email';
    let profileOwner = this.props.user.userId
      ? this.props.user.userId
      : this.state.userId;
    let shareTime = moment().valueOf();
    let sharedView = this.state.profileView;
    let isActive = this.props.user.isActive;
    let firstName = this.state.shareFirstName;
    let lastName = this.state.shareLastName;
    let email = this.state.shareEmail.toLowerCase();
    let competencyData = this.state.competencyList;
    let theme = this.state.selectedTheme;
    let shareConfiguration = [];
    if (competencyData.length > 0) {
      competencyData.map((data, index) =>
        shareConfiguration.push({
          competencyTypeId: data.competencyId,
          importance: this.state['RangeSliderValue' + index]
        })
      );
    }
    let soundtrack = this.state.soundTrack;
    console.log(soundtrack);

    let data = {
      sharedType,
      profileOwner,
      firstName,
      lastName,
      email,
      shareTime,
      shareConfiguration,
      sharedView,
      isActive,
      theme,
      soundtrack
    };

    console.log(data);

    spikeViewApiService('shareStudentProfile', data)
      .then(response => {
        if (response.data.status === 'Success') {
          _this.setState({
            isLoading: false,
            shareEmailModal: !this.state.shareEmailModal,
            shareFirstName: '',
            shareLastName: '',
            shareEmail: ''
          });
          showSuccessToast(response.data.message);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  activateValidation(e) {
    strategy.activateRule(this.validatorTypes, e.target.name);
    this.props.handleValidation(e.target.name)(e);
  }

  handleProfileNameChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleProfileView = event => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  render() {
    const { isLoading } = this.state;
    const themeSettings = {
      className: 'center',
      infinite: true,
      centerPadding: '60px',
      slidesToShow: 8,
      swipeToSlide: true,
      afterChange: function(index) {
        console.log(
          `Slider Changed to: ${index + 1}, background: #222; color: #bada55`
        );
      }
    };
    return (
      <div className="height--100">
        <div className="innerWrapper height--100">
          <Header {...this.props} />
          <ToastContainer
            autoClose={5000}
            className="custom-toaster-main-cls"
            toastClassName="custom-toaster-bg"
            transition={ZoomInAndOut}
          />
          <div className="topbar">
            <div className="fixed--topbar">
              <div className="share container">
                <div className="u--topDetails">
                  <div className="user-details flex">
                    <div className="user-icon">
                      {!this.state.profileImage ? (
                        <span className="icon-user_default2" />
                      ) : (
                        <img
                          className="object-fit-cover"
                          src={this.state.profileImage}
                          alt=""
                        />
                      )}
                    </div>

                    <div>
                      <div className="u--name">
                        <Link
                          to={{
                            pathname: '/student/profile/'
                          }}
                        >
                          {this.state.firstName} {this.state.lastName}
                        </Link>
                      </div>
                      <div className="u--email">{this.state.email}</div>
                    </div>
                  </div>

                  <ul className="viewChanger">
                    <li>
                      <input
                        type="radio"
                        name="profileView"
                        value="linear"
                        checked={
                          this.state.profileView === 'linear' ? true : false
                        }
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
                        name="profileView"
                        value="aerial"
                        checked={
                          this.state.profileView === 'aerial' ? true : false
                        }
                        onChange={this.handleProfileView}
                      />
                      <label className="radio-inline aerial">
                        <span className="icon-aerial_view icon" />
                        Presentation View
                      </label>
                    </li>
                  </ul>

                  <div className="ud--wrapper">
                    <div className="ud--right">
                      {/* <ul className="viewChanger">
                          <li>
                            <input type="radio" name="optradio" />
                            <label className="radio-inline linear">
                              <span className="icon-linear_view icon" />
                              Linear View
                            </label>
                          </li>

                          <li>
                            <input type="radio" name="optradio" />
                            <label className="radio-inline aerial">
                              <span className="icon-aerial_view icon" />
                              Aerial View
                            </label>
                          </li>
                        </ul> */}

                      {/* <FormControl
                          className="small"
                          type="text"
                          placeholder="Profile Name"
                          name="profileName"
                          value={this.state.profileName}
                          onChange={this.handleProfileNameChange}
                          autoComplete="off"
                        /> */}

                      <div className="button--wrapper">
                        <DropdownButton
                          bsStyle="primary"
                          title="Next"
                          id=""
                          name="profileName"
                        >
                          <MenuItem
                            eventKey="3.1"
                            onSelect={this.shareProfile.bind(this, 'Message')}
                          >
                            <span className="icon icon-share2" />
                            Share as Message
                          </MenuItem>
                          <MenuItem
                            eventKey="3.2"
                            onSelect={this.shareProfile.bind(this, 'Email')}
                          >
                            <span className="icon icon-share2" />
                            Share as Email
                          </MenuItem>
                        </DropdownButton>
                        <Button
                          bsStyle="default"
                          onClick={() =>
                            this.props.history.push('/student/profile')
                          }
                        >
                          cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container main home--innerWrapper pt--80 height--100">
            <div className="profile-sidebar">
              <div
                className="sidebarFixed postWrapper pt-0"
                ref={sideBar => (this.sideBar = sideBar)}
              >
                {/* <div className="postWrapper pt-0 fixed-sidebar"> */}
                <div className="pw-postHeader big-space">
                  <h5 className="mt-0 mb-0"> Select Importance</h5>
                </div>
                <div className="pw-postBody">
                  <ul className="range-slider--list">
                    {this.state.competencyList &&
                    this.state.competencyList.length > 0
                      ? this.state.competencyList.map((competency, index) => (
                          <li key={index}>
                            <div className="label--wrapper">
                              <label htmlFor="science">
                                {competency.name} :
                              </label>
                              <div className="value">
                                {this.state['RangeSliderImportance' + index]}
                              </div>
                            </div>
                            <div className="range-slider--control">
                              <RangeSlider
                                min={0}
                                max={12}
                                tooltip={false}
                                value={this.state['RangeSliderValue' + index]}
                                onChange={this.handleChange.bind(
                                  this,
                                  index,
                                  competency.name
                                )}
                                onChangeComplete={(sliderIndex, name, e) =>
                                  this.handleChangeComplete(
                                    e,
                                    index,
                                    competency.name
                                  )
                                }
                              />
                            </div>
                          </li>
                        ))
                      : 'No data available'}
                  </ul>
                </div>
              </div>
            </div>
            {/* Linear View */}
            {this.state.profileView === 'linear' ? (
              <div className="profileBox--mainContent">
                <ul className="myProfileInfo--wrapper">
                  <StudentSummary summary={this.state.summary} />
                  <StudentEducation educationData={this.state.educationData} />
                  <li className="myProfileInfo--item">
                    <div className="flex">
                      <div className="title--with--border">
                        <p>My Narrative</p>
                      </div>
                    </div>

                    {this.state.filteredAchievementList &&
                    this.state.filteredAchievementList.length > 0 ? (
                      this.state.filteredAchievementList.map((data, i) => (
                        <div
                          className="myProfileInfo--item--box"
                          key={i}
                          style={{
                            display:
                              data.achievement.length === 0 ? 'none' : 'block'
                          }}
                        >
                          <div className="section-main">
                            <div className="flex align-center justify-content-between">
                              <div className="section-main-title with-icon">
                                <span
                                  className={`icon ${
                                    CONSTANTS.icons[data._id]
                                  }`}
                                />
                                {data.name} ({data.achievement.length})
                              </div>
                            </div>

                            {this.renderAchievement(data.achievement, data)}
                          </div>

                          {this.renderRecommendationsByCompetency(
                            data._id,
                            data.name
                          )}

                          {this.state.showRecommendationComponent === true ? (
                            <CompetencyRecommendations
                              closeRecommendationComponent={
                                this.showRecommendationComponent
                              }
                              recommandationData={this.state.recommandationData}
                              competencyName={this.state.competencyName}
                            />
                          ) : (
                            ''
                          )}

                          <div className="section-main">
                            <Row>
                              {this.renderBadges(data.achievement)}
                              {this.renderCertificates(data.achievement)}
                              {this.renderTrophies(data.achievement)}
                            </Row>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="myProfileInfo--item--box">
                        <div className="content-box p-2">No Data Available</div>
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
                                        : limitCharacter(
                                            item.recommendation,
                                            200
                                          )}
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

                                    {/* <div className="helpful">
                                    <span>Helpful?</span>
                                    <span className="icon-badges icon" />
                                    <span>120</span>
                                  </div> */}
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
                                  loggedInUser: this.state.userId,
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
                </ul>
              </div>
            ) : (
              // Aerial View
              <div className="profileBox--mainContent">
                {/* <div className="thumbnail-slide">
                  <div className="flex justify-content-between">
                    {this.state.themes && this.state.themes.length > 0
                      ? this.state.themes.map((theme, index) => (
                          <div className="avBox" key={index}>
                            <input
                              type="radio"
                              name="themeBG"
                              id="av-thumb"
                              className="input-hidden"
                              checked={
                                this.state.selectedTheme === theme
                                  ? true
                                  : false
                              }
                              value={theme}
                            />
                            <label htmlFor="av-thumb">
                              <img
                                src={`../../assets/img/thumb/small/${theme}`}
                                alt="I'm av-thumb"
                                onClick={this.selectTheme.bind(this, theme)}
                              />
                            </label>
                            <span className="mask">
                              {' '}
                              <Glyphicon glyph="ok" />
                            </span>
                          </div>
                        ))
                      : ''}
                  </div>
                </div> */}
                <ShareAerialProfile
                  userData={this.state.userData}
                  educationData={this.state.educationData}
                  achievementData={this.state.filteredAchievementList}
                  recommandationData={this.state.userRecommendations}
                  selectedTheme={this.selectedTheme}
                  handleSoundTrack={this.handleSoundTrack}
                />
              </div>
            )}
          </div>
        </div>
        <Modal
          // bsSize="medium"
          show={this.state.shareEmailModal}
          onHide={this.shareEmailModal}
        >
          <Modal.Header closeButton>
            <Modal.Title className="subtitle text-center">
              Share with
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form horizontal className="lightBgForm">
              <Col sm={12}>
                <FormGroup
                  className={`centeredRightLabel ${this.getClasses(
                    'shareFirstName'
                  )}`}
                >
                  <Col componentClassName={ControlLabel} sm={4}>
                    First Name
                  </Col>
                  <Col sm={8}>
                    <FormControl
                      type="text"
                      placeholder="First Name"
                      name="shareFirstName"
                      value={this.state.shareFirstName}
                      onChange={this.handleProfileNameChange}
                      autoComplete="off"
                      maxLength="35"
                      onKeyPress={this.submitData}
                    />
                    {renderMessage(
                      this.props.getValidationMessages('shareFirstName')
                    )}
                  </Col>
                </FormGroup>
                <FormGroup
                  className={`centeredRightLabel ${this.getClasses(
                    'shareLastName'
                  )}`}
                >
                  <Col componentclassName={ControlLabel} sm={4}>
                    Last Name
                  </Col>
                  <Col sm={8}>
                    <FormControl
                      type="text"
                      placeholder="Last Name"
                      name="shareLastName"
                      value={this.state.shareLastName}
                      onChange={this.handleProfileNameChange}
                      autoComplete="off"
                      maxLength="35"
                      onKeyPress={this.submitData}
                    />
                    {renderMessage(
                      this.props.getValidationMessages('shareLastName')
                    )}
                  </Col>
                </FormGroup>

                <FormGroup
                  className={`centeredRightLabel ${this.getClasses(
                    'shareEmail'
                  )}`}
                >
                  <Col componentclassName={ControlLabel} sm={4}>
                    Email
                  </Col>
                  <Col sm={8}>
                    <FormControl
                      type="Email"
                      placeholder="Email"
                      name="shareEmail"
                      value={this.state.shareEmail}
                      onChange={this.handleProfileNameChange}
                      autoComplete="off"
                      onKeyPress={this.submitData}
                    />
                    {renderMessage(
                      this.props.getValidationMessages('shareEmail')
                    )}
                  </Col>
                </FormGroup>
              </Col>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              bsStyle="primary"
              className="no-bold no-round"
              disabled={isLoading}
              onClick={!isLoading ? this.validateData : null}
            >
              {isLoading ? 'In Progress...' : 'Send'}
            </Button>
            <Button
              bsStyle="default"
              className="no-bold no-round"
              onClick={this.shareEmailModal}
            >
              Close
            </Button>
          </Modal.Footer>
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

ShareProfile = validation(strategy)(ShareProfile);
export default connect(
  mapStateToProps,
  null
)(ShareProfile);
