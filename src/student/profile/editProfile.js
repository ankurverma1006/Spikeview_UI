import React, { Component } from 'react';
import Header from '../header/header';
import { confirmAlert } from 'react-confirm-alert';
import { Link } from 'react-router-dom';
import {
  Modal,
  Button,
  Media,
  Row,
  Col,
  FormControl,
  InputGroup
} from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ToastContainer } from 'react-toastify';
import Slider from 'react-slick';
import _ from 'lodash';
//import VideoThumbnail from 'react-video-thumbnail';

import ParentHeader from '../../parent/header/header';
//import Summary from './summary/addSummary';
import Education from './education/addEducation';
import Competency from './competency/addCompetency';
import CompetencyRecommendations from '../profile/competency/recommendations/competencyWiseRecommendations';
import ImageCropper from '../../common/cropper/imageCropper';
import sampleProfile from '../../assets/img/sample-profile.jpg';
//import Img from '../../common/cropper/img';
import {
  showErrorToast,
  uploadToAzure,
  limitCharacter,
  SampleNextArrow,
  SamplePrevArrow,
  getThumbImage,
  ZoomInAndOut
} from '../../common/commonFunctions';
import spikeViewApiService from '../../common/core/api/apiService';
import CONSTANTS from '../../common/core/config/appConfig';

import {
  actionGetStudentPersonalInfo,
  actionGetAllCompetency,
  actionGetAchievementsByUser,
  actionGetRecommendationsByUser,
  actionUpdateUserInfo,
  actionGetAchievementsData
} from '../../common/core/redux/actions';
import achievementDefaultImage from '../../assets/img/default_achievement.jpg';
import SpiderChart from '../../common/spiderChart/spiderChart';
import Achievement from './competency/achievements/addAchievement';
import Recommendation from './competency/recommendations/addRecommendation';
import ViewAchievement from './competency/achievements/viewAchievement';

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

var CompetencyLeve1Array=[{name:'Academic',level1:'Academic Competency',icon:"icon-academic icon"},
                            {name:'Vocational',level1:'Vocational Competency',icon:"icon-vocational icon"},
                            {name:'Arts',level1:'Arts Competency',icon:"icon-arts icon"},
                            {name:'Sports',level1:'Sports Competency',icon:"icon-sports icon"},                 
                            {name:'Life Experiences',level1:'Life Experiences',icon:"icon-life_experience icon"}        
                        ]
let photoGallery = {
                    infinite: true,
                    speed: 500,
                    slidesToShow: 1,
                    swipeToSlide: true,
                    nextArrow: <SampleNextArrow props={this.props} />,
                    prevArrow: <SamplePrevArrow props={this.props} />
                  };   

var spiderChartVar = 0;                  

class EditProfile extends Component {
  constructor(props, context) {
    super(props);
    this.state = {
      showSummaryComponent: false,
      showEducationComponent: false,
      showCompetencyComponent: false,
      showRecommendationComponent: false,
      addRecommendationComponent: false,
      showAchievementModal: false,
      showProfile: false,
      educationData: [],
      competencyData: [],
      recommandationData: [],
      userRecommendations: [],
      summary: '',
      firstName: '',
      lastName: '',
      userId: '',
      profileImage: '',
      coverImage: '',
      imageSource: '',
      imageName: '',
      imageType: '',
      sasToken: '',
      loader1: false,
      loader2: false,
      achievementPopup: false,
      competencyPopup: false,
      level1Competency: '',
      achievementData: [],
      achievementDataFlag: false,
      showDropdown: true,
      achievementObj: '',
      badges: [],
      certificates: [],
      skillList: [],
      isActive: 'true',
      chartData: [],
      contentEditable: false,
      editName: false,
      name: '',
      editTagLine: false,
      levelThreeCompetency: [],
      viewAchievement: false,
      SpiderChart: true,
      sliderImages: [],
      imagesPopup: false      
    };
    this.textInput = React.createRef();
    this.uploadImageToAzure = this.uploadImageToAzure.bind(this);
  }

  componentWillMount() {
    this.getProfileData();
    document.body.classList.add('light-theme');
    document.body.classList.add('absoluteHeader');
    document.body.classList.remove('home');
    document.body.classList.remove('fixedHeader');
  }

  componentWillReceiveProps(res) {
    this.setProfileData(res.user);
    this.setAchievementData(res.student.achievementData);
    this.renderRecommendationsByUserId(res.student.recommendationData);
  }

  componentDidMount() {
    this.getAllEducation();
    this.getAllCompetency();
    this.getAchievementsByUser();
    this.getRecommendationsByUser();
    this.setProfileData(this.props.user);
    this.getUserCount();
    this.skillCount();
  }

  showConfirmBox = () => {
    let data = this.props;
    console.log('data --- ',data);

    if (
      ((data.student.onlyAchievement[0] && data.student.onlyAchievement[0].achievement.length === 1) ||
        (data.student.achievementData[0] && data.student.achievementData[0].achievement.length === 1)) &&
      (data.user.summary === '' || data.user.summary === null)
    ) {

      console.log(' -- showConfirmBox -- --------------------------------------------------------------------');

      confirmAlert({
        customUI: ({ onClose }) => {
          return (  
            <div className="custom-ui">
              <p>
                Great job! Would you like to add a summary statement for your
                profile now – something that describes who you are in a sentence
                or two?
              </p>
              <button
                onClick={() => {
                  this.handleClickDelete();
                  onClose();
                }}
              >
                Add Summary
              </button>

              <button
                onClick={() => {
                  onClose();
                }}
              >
                No Thanks
              </button>
            </div>
          );
        }
      });
    }
  };

  handleClickDelete = () => {
    this.contentEditable();
  };

  contentEditable = () => {
    window.scrollTo(500, 0);

    this.setState({ contentEditable: !this.state.contentEditable });
  };

  setProfileData = data => {
    if (data) {
      let userId = data.userId;
      let summary = data.summary;
      let firstName = data.firstName;
      let lastName = data.lastName;
      // let tagline = data.tagline.trim();
      // let editTag = data.tagline.trim();
      let tagline = data.tagline ? data.tagline.trim() : null;
      let editTag = data.tagline ? data.tagline.trim() : null;

      let name =
        (data.firstName ? data.firstName : '') +
        ' ' +
        (data.lastName ? data.lastName : '');
      let profileImage = data.profilePicture;
      if (profileImage) {
        profileImage = getThumbImage('medium', profileImage);
      }
      let coverImage = data.coverImage;
      if (coverImage) {
        coverImage = getThumbImage('original', coverImage);
      }
      let isActive = data.isActive;
      this.setState({
        editTag,
        summary,
        firstName,
        lastName,
        userId,
        profileImage,
        coverImage,
        tagline,
        isActive,
        name
      });
    }
  };

  showSummaryComponent = () => {
    this.setState({
      showSummaryComponent: !this.state.showSummaryComponent
    });
  };

  showEducationComponent = () => {
    this.setState({
      showEducationComponent: !this.state.showEducationComponent,
      educationDetail: '',
      educationMode: 1
    });
  };

  showCompetencyComponent = (level1Competency, mode, level2CompetencyId) => {
    console.log(this.state.showCompetencyComponent);
    this.setState({
      showCompetencyComponent: !this.state.showCompetencyComponent,
      level1Competency: level1Competency,
      mode: mode,
      level2CompetencyId: level2CompetencyId
    });
  };

  showRecommendationComponent = (recommandationData, competencyName, event) => {
    this.setState({
      showRecommendationComponent: !this.state.showRecommendationComponent,
      recommandationData,
      competencyName
    });
  };

  editEducationComponent = educationDetail => {
    this.setState({
      educationDetail: educationDetail,
      showEducationComponent: !this.state.showEducationComponent,
      educationMode: 2
    });
  };

  getProfileData = () => {
    let userId = this.props.user.userId;
    this.props.actionGetStudentPersonalInfo(userId);
  };

  getAllEducation = () => {
    let userId = this.props.user.userId;
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

  handleImageChange = (action, event) => {
    this.setState({ imageSource: '' });
    const file = event.target.files[0];
    const fileName = file.name;
    const fileType = file.type;
    if (file) {
      this.generateSASToken();
      let reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = event => {
        this.setState({
          imageSource: event.target.result,
          imageName: fileName,
          imageType: fileType,
          action: action
        });
      };
    }
  };

  generateSASToken() {
    spikeViewApiService('getSASToken')
      .then(response => {
        if (response.data.status === 'Success') {
          let sasToken = response.data.result.sasToken;
          this.setState({ sasToken });
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  uploadImageToAzure(file) {
    let userId = this.state.userId;
    let type = this.state.action;
    let sasToken = this.state.sasToken;

    if (file !== '') {
      type === 1
        ? this.setState({ loader1: true, profileImage: '' })
        : this.setState({ loader2: true, coverImage: '' });
      uploadToAzure(
        type,
        userId,
        file,
        sasToken,
        (error, result, uploadPath, fileName) => {
          if (error) {
            return;
          }
          if (result) {
            if (type === 1) {
              // let profileImage = `${CONSTANTS.azureBlobURI}/${
              //   CONSTANTS.azureContainer
              // }/${uploadPath}`;
              let profileImage = getThumbImage('medium', fileName);
              this.setState({ profileImage: profileImage, loader1: false });
            }

            if (type === 2) {
              let coverImage = `${CONSTANTS.azureBlobURI}/${
                CONSTANTS.azureContainer
              }/${uploadPath}`;

              this.setState({ coverImage: coverImage, loader2: false });
            }
            this.updateUserData(type, uploadPath, userId);
            //console.log('upload is successful', uploadPath);
          }
        }
      );
    }
  }

  updateUserData = (type, uploadPath, userId) => {
    if (type === 1) {
      let profilePicture = uploadPath;
      let data = {
        userId,
        profilePicture
      };
      this.props.actionUpdateUserInfo({ profilePicture });
      spikeViewApiService('updateProfileImage', data);
    }

    if (type === 2) {
      let coverImage = uploadPath;
      let data = {
        userId,
        coverImage
      };
      this.props.actionUpdateUserInfo({ coverImage });
      spikeViewApiService('updateCoverImage', data);
    }
  };

  getAllCompetency() {
    this.props
      .actionGetAllCompetency()
      .then(response => {
        if (response.payload && response.payload.data.status === 'Success') {
          this.setState({ competencyData: response.payload.data.result });
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  getAchievementsByUser = () => {  
    let userId = this.props.user.userId;
    this.props.actionGetAchievementsByUser(userId).then(response => {     
       if(response.payload && response.payload.data){       
        if(response.payload.data.hasIncompleteAchievement){
          this.showConfirmBoxForIncompleteAchievement();
        }
       }
       this.setState({ achievementDataFlag: true});
    });
    this.props.actionGetAchievementsData(userId);
    this.props.actionGetRecommendationsByUser(userId);
  };

  showConfirmBoxForIncompleteAchievement = () => {   
      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <div className="custom-ui">
              <p>
                You have an incomplete achievements in your profile, kindly complete them.
              </p>         
              <button
                onClick={() => {
                  onClose();
                }}
              >
                OK
              </button>
            </div>
          );
        }
      });    
  };

  getRecommendationsByUser = () => {
    let userId = this.props.user.userId;
    this.props.actionGetRecommendationsByUser(userId);
  };

  setAchievementData = data => {
    console.log(data);
    //debugger;
    spiderChartVar=  spiderChartVar +1;
    if (data.length > 0) {
      this.setState({
        achievementData: data,
        showDropdown: true,
        SpiderChart: true              
      });
    } else {
      this.setState({
        achievementData: [],
        showDropdown: true      
      });
    }
  };

  toggleDropdown = () => {
    this.setState({
      showDropdown: !this.state.showDropdown
    });
  };

  // openAchievementPage = (achievement, level1Competency, level2CompetencyId) => {
  //   if (level1Competency && level2CompetencyId) {
  //     var level2CompetnecyData = _.filter(this.state.competencyData, {
  //       level1: level1Competency
  //     });

  //     var level2Data = _.filter(level2CompetnecyData[0].level2, {
  //       competencyTypeId: level2CompetencyId
  //     });

  //     this.setState({
  //       viewAchievement: !this.state.viewAchievement,
  //       achievementDetail: achievement,
  //       levelThreeCompetency: level2Data[0].level3
  //     });
  //   }

  //   this.setState({
  //     viewAchievement: !this.state.viewAchievement
  //   });

  //   // this.props.history.push({
  //   //   pathname: '/student/achievementdetail',
  //   //   state: {
  //   //     achievementDetails: achievement,
  //   //     achievementData: data.achievement,
  //   //     name: data.name,
  //   //     student: this.props.student
  //   //   }
  //   // });
  // };

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
                          alt="Trophy"
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

  renderRecommendationsByCompetency(
    competencyId,
    competencyName,
    recommandations
  ) {
    return (
      <div>
        {recommandations.length > 0 ? (
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
                  index <= 2 ? (
                    <li key={index}>
                      {recommandation.recommender.profilePicture ? (
                        <img
                          className="t--img"
                          src={getThumbImage(
                            'medium',
                            recommandation.recommender.profilePicture
                          )}
                          alt=""
                        />
                      ) : (
                        <div className="t--img">
                          <span className="icon-user_default2 default-icon centeredBox" />
                        </div>
                      )}

                      <div className="t--body">
                        <div className="t--name">
                          {recommandation.recommender.firstName}
                          {recommandation.stage === 'Requested' ? (
                            <div className="status pending">pending</div>
                          ) : recommandation.stage === 'Replied' ? (
                            <a
                              className="status atp"
                              onClick={this.addToProfileRecommendation.bind(
                                this,
                                recommandation.recommendationId
                              )}
                            >
                              Add to profile
                            </a>
                          ) : (
                            // <Button bsStyle="with-border btn-block">
                            //   Add to profile
                            // </Button>
                            ''
                          )}
                        </div>
                        <div className="t--content">
                          {recommandation.stage === 'Requested'
                            ? limitCharacter(recommandation.request, 100)
                            : limitCharacter(
                                recommandation.recommendation,
                                100
                              )}
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

  renderRecommendationsByUserId = data => {
    let recommandations = data;
    if (recommandations.length > 0) {
      this.setState({
        userRecommendations: recommandations
      });
    } else {
      this.setState({
        userRecommendations: []
      });
    }
  };

  addToProfileRecommendation = recommendationId => {
    if (recommendationId) {
      let stage = 'Added';
      let data = {
        recommendationId,
        stage
      };
      spikeViewApiService('addToProfileRecommendation', data)
        .then(response => {
          if (response.data.status === 'Success') {
            this.getAchievementsByUser();
            //this.renderRecommendationsByUserId();
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  getUserCount() {
    let userId = this.props.user.userId;
    let sharedId = 0;
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

  skillCount = () => {
    let userId = this.props.user.userId;
    let sharedId = 0;
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
  };

  shareProfile = () => {
    if (this.state.isActive === false) {
      showErrorToast("You are inactive user, so can't able to share profile");
    } else {
      this.props.history.push({
        pathname: this.props.parent
          ? '/student/shareprofile'
          : '/student/shareprofile',
        state: {
          profileShare: 1
        }
      });
    }
    // } else if (this.state.achievementData.length === 0) {
    //   showErrorToast('Please add some achievements to share profile');
    // }
  };

  handleChange = event => {
    var filter = /^[a-zA-Z\s]+$/;
    if ([event.target.name]=="name" && event.target.value!="" &&  !filter.test(event.target.value)) {         
      return false
    }
    this.setState({ [event.target.name]: event.target.value });
  };

  submitData = event => {
    let userId = this.state.userId;
    let summary = this.state.summary ? this.state.summary.trim() : '';
    let data = {
      userId,
      summary
    };

    // if (summary) {
    this.props.actionUpdateUserInfo({ summary });
    spikeViewApiService('updateUserSummary', data);
    this.setState({
      contentEditable: false
    });
    // } else {
    //   this.setState({
    //     summary: summary,
    //     contentEditable: false
    //   });
    // }
  };

  makeNameEditable = () => {
    let name =
      (this.state.firstName ? this.state.firstName : '') +
      ' ' +
      (this.state.lastName ? this.state.lastName : '');
    this.setState({
      editName: true,
      name: name
    });
  };

  makeTagLineEditable = () => {
    let editTag = this.state.tagline ? this.state.tagline : '';
    this.setState({
      editTagLine: !this.state.editTagLine,
      editTag: editTag
    });
  };

  saveName = () => {
    let userId = this.state.userId;
    let name = this.state.name.trim();  

    if (name) {
      var newArray = name.split(' ').map(function(item, index) {
        if (item.length > 0) {
          return item;
        }
      });

      let firstName = newArray.length > 0 ? newArray[0] : '';
      if (newArray.length > 1) {
        var lastName = newArray.slice(1).join(' ');
      }

      if (firstName && firstName.length > 35) {
        showErrorToast(
          'Your first name should not be more than 35 characters.'
        );
      } else if (lastName && lastName.length > 35) {
        showErrorToast('Your last name should not be more than 35 characters.');
      } else {
        let data = {
          userId,
          firstName,
          lastName
        };
        this.props.actionUpdateUserInfo({ firstName, lastName });
        spikeViewApiService('updateName', data)
          .then(response => {
            if (response.data.status === 'Success') {
              this.setState({ editName: false });
            }
          })
          .catch(err => {
            this.setState({ editName: false });
            console.log(err);
          });
      }
    } else {
      this.setState({ editName: false });
    }
  };

  saveTagLine = () => {
    let userId = this.state.userId;
    let tagline = this.state.editTag;
    let data = {
      userId,
      tagline
    };
    //if (tagline) {
    this.props.actionUpdateUserInfo({ tagline });
    spikeViewApiService('updateUserTagline', data)
      .then(response => {
        if (response.data.status === 'Success') {
          this.setState({ editTagLine: false });
        }
      })
      .catch(err => {
        this.setState({ editTagLine: false });
        console.log(err);
      });
    // } else {
    //   this.setState({ editTagLine: false });
    // }
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
        if (assetData[0].type === 'image') {
          imgSource = getThumbImage('medium', assetData[0].file);
        } else if (assetData[0].type === 'video') {
          imgSource = achievementDefaultImage;
        }

        // `${
        //   CONSTANTS.azureBlobURI
        // }/${CONSTANTS.azureContainer}/${assetData[0].file}`;
      } else if (certificatesData.length > 0) {
        imgSource = getThumbImage('medium', certificatesData[0].file);
        // imgSource = `${CONSTANTS.azureBlobURI}/${CONSTANTS.azureContainer}/${
        //   certificatesData[0].file
        // }`;
      } else if (badgesData.length > 0) {
        imgSource = getThumbImage('medium', badgesData[0].file);
        // imgSource = `${CONSTANTS.azureBlobURI}/${CONSTANTS.azureContainer}/${
        //   badgesData[0].file
        // }`;
      } else {
        imgSource = achievementDefaultImage;
      }
    }
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
            level1Competency={this.state.level1Competency}
            achievementDetail={this.state.achievementDetail}
            closeViewAchievement={this.openAchievementPage}
            getAchievementsByUser={this.getAchievementsByUser}
          />
        ) : (
          ''
        )}
      </div>
    );
  };

  showAchievementComponent = (
    levelThreeCompetency,
    level2Competency,
    competencyTypeId
  ) => {
    this.setState({
      showAchievementComponent: !this.state.showAchievementComponent,
      levelThreeCompetency,
      level2Competency,
      competencyTypeId
    });
  };

  showAchievementModal = (
    levelThreeCompetency,
    level2Competency,
    competencyTypeId
  ) => {
    console.log(this.state['AchievementModal_' + competencyTypeId]);
    this.setState({
      ['AchievementModal_' + competencyTypeId]: !this.state[
        'AchievementModal_' + competencyTypeId
      ],
      levelThreeCompetency,
      level2Competency,
      competencyTypeId
    });
  };

  addRecommendationComponent = (
    levelThreeCompetency,
    level2Competency,
    competencyTypeId
  ) => {
    console.log(this.state['addRecommendationComponent_' + competencyTypeId]);
    this.setState({
      ['addRecommendationComponent_' + competencyTypeId]: !this.state[
        'addRecommendationComponent_' + competencyTypeId
      ],
      levelThreeCompetency,
      level2Competency,
      competencyTypeId
    });
  };

  viewSampleProfile = () => {
    this.setState({
      showProfile: !this.state.showProfile
    });
  };

  recommendationList = () => {
    let _this = this;
    setTimeout(function() {
      _this.props.history.push({
        pathname: '/student/recommendations',
        state: {
          loggedInUser: _this.state.userId
        }
      });
    }, 500);
  };

  showRecommendationDetail = item => {
    if (item) {
      this.props.history.push({
        pathname: '/student/recommendationdetail',
        state: {
          recommendationDetail: item,
          loggedInUser: this.state.userId,
          type: '',
          searchUserId: ''
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
        {this.state.imageSource ? (
          <ImageCropper
            imageSource={this.state.imageSource}
            imageName={this.state.imageName}
            imageType={this.state.imageType}
            aspectRatio={this.state.action === 1 ? 1 / 1 : 16 / 9}
            modalSize={this.state.action === 1 ? 'medium' : 'large'}
            cropBoxWidth={this.state.action === 1 ? '200' : '700'}
            cropBoxHeight={this.state.action === 1 ? '200' : '700'}
            uploadImageToAzure={this.uploadImageToAzure}
          />
        ) : null}

        <div className="profileBox">
          <div className="banner">
            <div className="loader">
              <img
                src="../../assets/img/svg-loaders/three-dots.svg"
                width="50"
                alt="loader"
                style={
                  this.state.loader2 === true
                    ? { visibility: 'visible' }
                    : { visibility: 'hidden' }
                }
              />
            </div>
            {!this.state.coverImage ? (
              <img className="bannerImg" src="" alt="" />
            ) : (
              <img className="bannerImg" src={this.state.coverImage} alt="" />
            )}

            <div className="container">
              <div className="profile-info--wrapper">
                <div
                  className={
                    this.state.editName
                      ? 'content content--editable edit--me'
                      : 'content edit--me'
                  }
                >
                  <p className="pName hide--me">
                    {this.state.firstName} {this.state.lastName}
                    <span
                      className="icon-edit_pencil edit-icon"
                      onClick={this.makeNameEditable}
                    />
                  </p>
                  <div className="editableFormControl animated a--top">
                    <InputGroup>
                      <FormControl
                        placeholder="Enter Here"
                        className="custom-form--control"
                        onChange={this.handleChange}
                        name="name"
                        value={this.state.name}
                        autoFocus={true}
                        onBlur={this.saveName}
                        maxLength="71"
                      />
                      <InputGroup.Addon>
                        <span
                          className="icon-right_tick"
                          onClick={this.saveName}
                        />
                      </InputGroup.Addon>
                    </InputGroup>
                  </div>
                </div>

                {!this.state.tagline && this.state.editTagLine === false ? (
                  <div className="addTagLine--wrapper">
                    <div
                      className="btn fs-14 mt-0 with-icon smallBtn"
                      onClick={this.makeTagLineEditable}
                    >
                      <span className="icon-plus" />
                      Add Tagline
                    </div>
                  </div>
                ) : this.state.editTagLine === true ? (
                  <div className="content content--editable edit--me">
                    <div className="editableFormControl animated a--top">
                      <InputGroup>
                        <FormControl
                          componentClass="textarea"
                          placeholder="Enter Here"
                          className="custom-form--control"
                          onChange={this.handleChange}
                          name="editTag"
                          value={this.state.editTag}
                          onBlur={this.saveTagLine}
                          autoFocus={true}
                          maxLength="100"
                        />
                        <InputGroup.Addon>
                          <span
                            className="icon-right_tick"
                            onClick={this.saveTagLine}
                          />
                        </InputGroup.Addon>
                      </InputGroup>
                    </div>
                  </div>
                ) : this.state.tagline !== '' &&
                this.state.editTagLine === false ? (
                  <div className="content edit--me">
                    <p className="pDesc hide--me">
                      {this.state.tagline ? this.state.tagline : ''}
                      <span
                        className="icon-edit_pencil edit-icon"
                        onClick={this.makeTagLineEditable}
                      />
                    </p>
                  </div>
                ) : (
                  ''
                )}

                {this.state.isActive === false ? (
                  showErrorToast(
                    "'Your Profile is Inactive, Until Your Parent Approves'"
                  )
                ) : this.state.achievementData.length > 0 ? (
                  <Button
                    className="btn btn-white with-icon"
                    onClick={this.shareProfile.bind(this)}
                  >
                    <span className="icon-share2" />
                    Share
                  </Button>
                ) : null}
              </div>

              <div className="custom-upload">
                <input
                  type="file"
                  onChange={this.handleImageChange.bind(this, 2)}
                  accept="image/*"
                  value=""
                />
                <span className="icon-camera icon icon" /> Add Cover Photo
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
                    // <Img
                    //   src={this.state.profileImage}
                    //   default="../../assets/img/svg-loaders/three-dots.svg"
                    // />
                    <img src={this.state.profileImage} alt="" />
                  )}

                  <div
                    className="loader"
                    style={
                      this.state.loader1 === true
                        ? { visibility: 'visible' }
                        : { visibility: 'hidden' }
                    }
                  >
                    <img
                      src="../../assets/img/svg-loaders/three-dots.svg"
                      width="50"
                      alt="loader"
                    />
                  </div>

                  <div className="editProfile--wrapper">
                    <div className="editProfile">
                      <input
                        type="file"
                        onChange={this.handleImageChange.bind(this, 1)}
                        accept="image/*"
                        value=""
                      />
                      <span className="icon-camera icon" />
                    </div>
                  </div>
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
                  userId={this.props.user.userId}
                  sharedId="0"
                  path="/student/profile"
                  spiderChartVar= {spiderChartVar}
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
                                  <td className="tableValue">{skill.count}</td>
                                </tr>
                              ) : null
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
                {/* SUMMARY SECTION START */}
                {this.state.achievementData &&
                this.state.achievementData.length > 0 ? (
                  <li className="myProfileInfo--item">
                    <div className="title--with--border">
                      <p>Summary</p>
                    </div>

                    <div className="myProfileInfo--item--box">
                      {!this.state.summary &&
                      this.state.contentEditable === false ? (
                        <div className="centeredBox content p-2">
                          <Button
                            bsStyle="primary"
                            className="animated animated-top"
                            onClick={this.contentEditable}
                          >
                            Add Summary
                          </Button>
                        </div>
                      ) : this.state.contentEditable === true ? (
                        <div className="centeredBox content content--editable p-2">
                          <div className="editableFormControl animated a--top">
                            <FormControl
                              componentClass="textarea"
                              placeholder="Enter Here"
                              name="summary"
                              value={this.state.summary}
                              onChange={this.handleChange}
                              onBlur={this.submitData}
                              autoFocus={true}
                              maxLength="500"
                            />
                          </div>
                        </div>
                      ) : this.state.summary !== '' &&
                      this.state.contentEditable === false ? (
                        <div>
                          <div className="content-box--edit text-right">
                            <a
                              onClick={this.contentEditable}
                              style={{ cursor: 'pointer' }}
                            >
                              <span className="icon-edit_pencil icon" />
                            </a>
                          </div>
                          <p>{this.state.summary.trim()}</p>
                        </div>
                      ) : (
                        ''
                      )}
                    </div>
                  </li>
                ) : (
                  ''
                )}
                {/* SUMMARY SECTION END */}

                {/* EDUCATION SECTION START */}
                {this.state.achievementData &&
                this.state.achievementData.length > 0 ? (
                  <li className="myProfileInfo--item">
                    <div className="flex">
                      <div className="title--with--border">
                        <p>Education</p>
                      </div>

                      {this.state.educationData.length !== 0 ? (
                        <div className="round-fixed-width-btn--wrapper">
                          <a
                            className="round-fixed-width-btn"
                            onClick={this.showEducationComponent}
                            style={{ cursor: 'pointer' }}
                          >
                            +
                          </a>
                        </div>
                      ) : (
                        ''
                      )}
                    </div>

                    <div className="myProfileInfo--item--box">
                      {this.state.showEducationComponent ? (
                        <Education
                          closeEducationComponent={this.showEducationComponent}
                          educationDetail={this.state.educationDetail}
                          getAllEducation={this.getAllEducation}
                          educationMode={this.state.educationMode}
                        />
                      ) : null}

                      {this.state.educationData.length === 0 ? (
                        <div className="centeredBox p-2">
                          <Button
                            bsStyle="primary"
                            className="btn-bold no-round"
                            onClick={this.showEducationComponent}
                          >
                            Add Education
                          </Button>
                        </div>
                      ) : (
                        this.state.educationData.map((data, index) => (
                          <div key={index} className="relative--box">
                            <div className="content-box--edit text-right">
                              <a
                                onClick={this.editEducationComponent.bind(
                                  this,
                                  data
                                )}
                              >
                                <span className="icon-edit_pencil icon" />
                              </a>
                            </div>
                            <Media className="school-info--wrapper">
                              <Media.Left>
                                {data.logo !== '' ? (
                                  <img
                                    src={getThumbImage('small', data.logo)}
                                    alt=""
                                  />
                                ) : (
                                  <span className="icon-school icon lg-icon" />
                                )}
                              </Media.Left>
                              <Media.Body>
                                <Media.Heading className="s--name">
                                  {data.institute}
                                </Media.Heading>
                                <p className="s--duration">
                                  {data.fromGrade} to {data.toGrade}{' '}
                                  <span className="s--year">
                                    {data.fromYear + ' to ' + data.toYear}{' '}
                                  </span>
                                </p>
                                <p
                                  className="s--summary"
                                  title={data.description}
                                >
                                  {data.description
                                    ? limitCharacter(data.description, 165)
                                    : ''}
                                </p>
                              </Media.Body>
                            </Media>
                          </div>
                        ))
                      )}
                    </div>
                  </li>
                ) : (
                  ''
                )}
                {/* EDUCATION SECTION END */}

                {/* COMPETENCY SECTION START */}               
              
                <div
                  className="summaryFirstLook"
                  style={{
                    display:
                    this.state.achievementData && this.state.achievementDataFlag
                              ? this.state.achievementData.length > 0 ? 'none':'block' :'none'
                  }}
                >
                  <h3 className="text-center hero-head">
                    {' '}
                    Welcome to spikeview!
                  </h3>

                  <p className="lead">
                    To build out your narrative, start by adding some
                    achievements. Follow the two steps below:
                  </p>

                  <ol className="orderedList">
                    <li>
                      Select your focus area or Competency from the options
                      below
                    </li>
                    <li>
                      {' '}
                      In the selected Competency, click on the Add Achievement
                      button and provide the details. Wherever possible, add
                      images and videos to enrich your profile.
                    </li>
                  </ol>

                  <div align="center">
                    <button
                      className="btn btn-deep-blue my-20 p-10 text-uppercase with-icon smallBtn mr-1"
                      onClick={this.viewSampleProfile}
                    >
                      View Sample Profile
                    </button>
                  </div>
                </div>              
                {/* <li
                  className="profileContent"
                  style={{
                    display:
                      this.state.achievementData.length > 0 ? 'none' : 'block'
                  }}
                >
                  <h3 className="text-center hero-head">
                    {' '}
                    Welcome to Spikeview!<br /> To build out your narrative,
                    let’s start by adding some achievements.
                  </h3>
                  <div className="profilemt20">
                    <p className="greytxt">
                      - Select your focus area or competency{' '}
                    </p>
                    <p className="greytxt">
                      - In the selected Competency, click on the Add Achievement
                      button and provide the details. Wherever possible, add
                      images and videos to enrich your profile.
                    </p>
                  </div>
                </li> */}

                <li
                  className={
                    this.state.showDropdown === true
                      ? 'myProfileInfo--item show-dropdown'
                      : 'myProfileInfo--item'
                  }
                >
                  {this.state.showCompetencyComponent &&
                  !this.state.showAchievementComponent ? (
                    <Competency
                      closeCompetencyComponent={this.showCompetencyComponent.bind(
                        this,
                        '',
                        1,
                        ''
                      )}
                      level1Competency={this.state.level1Competency}
                      level2CompetencyId={this.state.level2CompetencyId}
                      userId={this.state.userId}
                      mode={this.state.mode}
                      getAchievementsByUser={this.getAchievementsByUser}
                      getRecommendationsByUser={this.getRecommendationsByUser}
                      contentEditable={this.contentEditable}
                      {...this.props}
                    />
                  ) : null}

                  <div className="flex">
                  {this.state.achievementDataFlag ?  <div className="title--with--border">
                      <p>Create Your Story</p>
                    </div>:null}

                    {this.state.achievementData.length > 0 ? (
                      <div className="round-fixed-width-btn--wrapper">
                        <a
                          className="round-fixed-width-btn"
                          onClick={this.toggleDropdown}
                          style={{ cursor: 'pointer' }}
                        >
                          {this.state.showDropdown === true ? '-' : '+'}
                        </a>
                      </div>
                    ) : null}
                  </div>
                  {this.state.showDropdown === true ? (
                    <ul className="flex flex-list--row color-bg-ico">
                   
                   {CompetencyLeve1Array.map((compItem, index) => {
                        let competencyData= this.state.competencyData;
                        let competencyDataIndex= competencyData.findIndex(todo => todo.level1==compItem.level1);
                        return  competencyDataIndex!==-1 ?
                         <li key={index}>  <a
                                  onClick={this.showCompetencyComponent.bind(
                                    this,
                                    competencyData[competencyDataIndex].level1,
                                    1,
                                    ''
                                  )}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <span className={compItem.icon} />
                                  {compItem.name} <br />
                                </a> </li>
                                :''
                          }                         
                          )}                      
                    </ul>) : (
                    ''
                  )}
                              
                 
{/*                    
                      {this.state.competencyData.length > 0
                        ? this.state.competencyData.map((item, index) => (
                            <li key={index}>
                              {item.level1 === 'Academic Competency' ? (
                                <a
                                  onClick={this.showCompetencyComponent.bind(
                                    this,
                                    item.level1,
                                    1,
                                    ''
                                  )}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <span className="icon-academic icon" />
                                  Academic <br />
                                </a>
                              ) : item.level1 === 'Sports Competency' ? (
                                <a
                                  onClick={this.showCompetencyComponent.bind(
                                    this,
                                    item.level1,
                                    1,
                                    ''
                                  )}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <span className="icon-sports icon" />
                                  Sports <br />
                                </a>
                              ) : item.level1 === 'Arts Competency' ? (
                                <a
                                  onClick={this.showCompetencyComponent.bind(
                                    this,
                                    item.level1,
                                    1,
                                    ''
                                  )}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <span className="icon-arts icon" />
                                  Arts <br />
                                </a>
                              ) : item.level1 === 'Vocational Competency' ? (
                                <a
                                  onClick={this.showCompetencyComponent.bind(
                                    this,
                                    item.level1,
                                    1,
                                    ''
                                  )}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <span className="icon-vocational icon" />
                                  Vocational <br />
                                </a>
                              ) : item.level1 === 'Life Experiences' ? (
                                <a
                                  onClick={this.showCompetencyComponent.bind(
                                    this,
                                    item.level1,
                                    1,
                                    ''
                                  )}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <span class="icon-life_experience icon" />
                                  Life <br /> Experiences
                                </a>
                              ) : (
                                ''
                              )} */}
                            
                            {/* </li>
                          ))
                        : ''}
                    </ul>
                   */}

                  {this.state.achievementData &&
                  this.state.achievementData.length > 0
                    ? this.state.achievementData.map((data, i) => (
                        <div key={i} className="myProfileInfo--item--box">
                          <div className="section-main">
                            <div
                              className="flex align-center justify-content-between mb-10"
                              key={i}
                            >
                              <div className="section-main-title with-icon">
                                <span
                                  className={`icon ${
                                    CONSTANTS.icons[data._id]
                                  }`}
                                />
                                &nbsp;
                                {data.name}
                              </div>
                              {this.state.competencyData.map(
                                (item, index) =>
                                  item.level1 === data.level1
                                    ? item.level2.map(
                                        (level2, index2) =>
                                          level2.name === data.name ? (
                                            <span>
                                              <a
                                                key={index2}
                                                className="btn btn-with-border with-icon smallBtn"
                                                onClick={this.showAchievementModal.bind(
                                                  this,
                                                  level2.level3,
                                                  data.name,
                                                  data._id
                                                )}
                                              >
                                                <span className="icon-plus" />
                                                Add Achievement
                                              </a>
                                              {/* <a
                                                key={index}
                                                style={{ cursor: 'pointer' }}
                                                onClick={this.showCompetencyComponent.bind(
                                                  this,
                                                  item.level1,
                                                  2,
                                                  data._id
                                                )}
                                              >
                                                <span className="icon-edit_pencil icon md-icon" />
                                              </a> */}

                                              {this.state[
                                                'AchievementModal_' + data._id
                                              ] ? (
                                                <Achievement
                                                  closeAchievementComponent={
                                                    this
                                                      .showAchievementComponent
                                                  }
                                                  showConfirmBox={
                                                    this.showConfirmBox
                                                  }
                                                  levelThreeCompetency={
                                                    this.state
                                                      .levelThreeCompetency
                                                  }
                                                  level2Competency={
                                                    this.state.level2Competency
                                                  }
                                                  userId={this.state.userId}
                                                  competencyTypeId={
                                                    this.state.competencyTypeId
                                                  }
                                                  getAchievementsByUser={
                                                    this.getAchievementsByUser
                                                  }
                                                  closeAchievementModal={
                                                    this.showAchievementModal
                                                  }
                                                  type="1"
                                                />
                                              ) : null}

                                              <a
                                                className="btn btn-with-border with-icon smallBtn"
                                                onClick={this.addRecommendationComponent.bind(
                                                  this,
                                                  level2.level3,
                                                  data.name,
                                                  data._id
                                                )}
                                              >
                                                <span className="icon-plus" />{' '}
                                                Add Recommendation
                                              </a>

                                              {this.state[
                                                'addRecommendationComponent_' +
                                                  data._id
                                              ] ? (
                                                <Recommendation
                                                  closeRecommendationComponent={
                                                    this
                                                      .addRecommendationComponent
                                                  }
                                                  levelThreeCompetency={
                                                    this.state
                                                      .levelThreeCompetency
                                                  }
                                                  level2Competency={
                                                    this.state.level2Competency
                                                  }
                                                  userId={this.state.userId}
                                                  competencyTypeId={
                                                    this.state.competencyTypeId
                                                  }
                                                  getAchievementsByUser={
                                                    this.getAchievementsByUser
                                                  }
                                                  getRecommendationsByUser={
                                                    this
                                                      .getRecommendationsByUser
                                                  }
                                                  type="1"
                                                />
                                              ) : null}
                                            </span>
                                          ) : (
                                            ''
                                          )
                                      )
                                    : ''
                              )}
                            </div>
                            {/* <ul className="slider"> // <a
                                    //   key={index}
                                    //   style={{ cursor: 'pointer' }}
                                    //   onClick={this.showCompetencyComponent.bind(
                                    //     this,
                                    //     item.level1,
                                    //     2,
                                    //     data._id
                                    //   )}
                                    // >
                                    //   <span className="icon-edit_pencil icon md-icon" />
                                    // </a> */}
                            {data.achievement && data.achievement.length > 0 ? (
                              <div>
                                <Slider
                                  {...settings}
                                  className="slider withLongTitle--250"
                                >
                                  {data.achievement.map(
                                    (achievement, index) => (
                                      <div className="slider-item" key={index}>
                                        <a style={{ cursor: 'pointer' }}>
                                          <span className="image-section">
                                            {/*<span className="image-section-links">
                                          <div className="likes--count">
                                              <span className="icon-camera icon icon" />
                                              23
                                            </div> */}
                                            {/* <span className="image-section--category">
                                              12th Grade
                                            </span> 
                                          </span>*/}
                                            {this.renderMedia(
                                              achievement.asset,
                                              achievement,
                                              data.level1,
                                              data._id
                                            )}
                                          </span>
                                          <span className="image-section-title">
                                            {limitCharacter(
                                              achievement.title,
                                              32
                                            )}
                                          </span>
                                        </a>
                                      </div>
                                    )
                                  )}
                                </Slider>
                              </div>
                            ) : (
                              ''
                            )}
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
                    : ''}
                </li>
                {/* COMPETENCY SECTION END */}
                {this.state.userRecommendations &&
                this.state.userRecommendations.length > 0 ? (
                  <li className="myProfileInfo--item">
                    <div className="title--with--border">
                      <p>Recommendation</p>
                    </div>
                    <div className="myProfileInfo--item--box">
                      <Row className="show-grid">
                        {this.state.userRecommendations.map(
                          (item, index) =>
                            index <= 2 ? (
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
                                      ? limitCharacter(item.request, 200)
                                      : limitCharacter(
                                          item.recommendation,
                                          200
                                        )}
                                  </p>

                                  <div class="t--name">
                                    <div class="status pending">
                                      {item.stage === 'Requested' ? (
                                        <div className="status pending">
                                          pending
                                        </div>
                                      ) : item.stage === 'Replied' ? (
                                        <a
                                          className="status atp"
                                          onClick={this.addToProfileRecommendation.bind(
                                            this,
                                            item.recommendationId
                                          )}
                                        >
                                          Add to profile
                                        </a>
                                      ) : (
                                        // <Button bsStyle="with-border btn-block">
                                        //   Add to profile
                                        // </Button>
                                        ''
                                      )}
                                    </div>
                                  </div>

                                  {/* <button
                                    className="btn-link m-t-15"
                                    onClick={this.showRecommendationComponent.bind(
                                      this,
                                      item,
                                      ''
                                    )}
                                  >
                                    Read More
                                  </button> */}

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
                          onClick={this.recommendationList.bind(this)}
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
              <Modal
                show={this.state.showProfile}
                onHide={this.viewSampleProfile}
                backdrop="static"
                keyboard={false}
              >
                <Modal.Header closeButton>
                  <Modal.Title>Sample Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div>
                    <img src={sampleProfile} alt="f" />
                  </div>
                </Modal.Body>
              </Modal>
            </div>
          </div>
        </div>
         {/*images popup */}
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
    parent: state.User.parentData,
    student: state.Student
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      actionGetStudentPersonalInfo,
      actionGetAllCompetency,
      actionGetAchievementsByUser,
      actionGetRecommendationsByUser,
      actionUpdateUserInfo,
      actionGetAchievementsData
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditProfile);
