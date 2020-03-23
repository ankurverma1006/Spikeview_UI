import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';
import { Portal } from 'react-overlays';
import {
  Button,
  Modal,
  Form,
  FormGroup,
  Checkbox,
  Col,
  ControlLabel,
  FormControl,
  InputGroup
} from 'react-bootstrap';

import Select from 'react-select';
import 'react-select/dist/react-select.css';
import { YearPicker, MonthPicker, DayPicker } from 'react-dropdown-date';
//import DatePicker from 'react-datepicker';
//import DatePicker from '../../../../assets/react-datepicker/es/index';
import moment from 'moment';
import validation from 'react-validation-mixin';
import strategy from 'react-validatorjs-strategy';
import classnames from 'classnames';
import ImageCropper from '../../../../common/cropper/imageCropper';
import achievementDefaultImage from '../../../../assets/img/default_achievement.jpg';
import _ from 'lodash';

import CONSTANTS from '../../../../common/core/config/appConfig';
import {
  renderMessage,
  isValidURL,
  ZoomInAndOut,
  generateTimestamp,
  showErrorToast
} from '../../../../common/commonFunctions';
import spikeViewApiService from '../../../../common/core/api/apiService';
import MediaList from '../mediaList';

let validationMessages = CONSTANTS.validationMessages;
let regExpressions = CONSTANTS.regExpressions;
let badgeImgArray = [];
let badgeImgPreview = [];
let certificateImgArray = [];
let certificateImgPreview = [];
let mediaImgArray = [];
let mediaImgPreview = [];
const emptyToDate = '10000000';

const options = [
  {
    value: 'Certificate',
    label: (
      <div>
        Certificate <span className="icon-certificate" />
      </div>
    )
  },
  {
    value: 'Badges',
    label: (
      <div>
        Badges <span className="icon-badges" />
      </div>
    )
  },
  {
    value: 'Images',
    label: (
      <div>
        Images <span className="icon-image_tag" />
      </div>
    )
  },
  {
    value: 'Videos',
    label: (
      <div>
        Videos <span className="icon-video_tag" />
      </div>
    )
  }
];

class addAchievement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      achievementModal: true,
      levelThreeCompetency: [],
      skillList: [],
      importanceList: [],
      title: '',
      description: '',
      skills: '',
      importance: '',
      level3Competency: '',
      startDate: '',
      endDate: '',
      promptRecommendation: false,
      achievementId: '',
      competencyTypeId: '',
      userId: '',
      badges: [],
      badgePreview: '',
      badgeImgArray: [],
      badgeImgPreview: [],
      certificateImgArray: [],
      certificateImgPreview: [],
      mediaImgArray: [],
      mediaImgPreview: [],
      imagesModal: false,
      type: '',
      sasToken: '',
      badgesData: [],
      certificatesData: [],
      mediaData: [],
      todaysDate: false,
      imageSource: '',
      imageName: '',
      imageType: '',
      // startYear: moment().format('YYYY'),
      // startMonth: moment().format('M') - 1,
      // //startDay: moment().format('D'),
      // endYear: moment().format('YYYY'),
      // endMonth: moment().format('M') - 1,
      // endDay: moment().format('D'),
      // startYear: new Date().getFullYear(),
      // startMonth: new Date().getMonth(),
      // startDay: new Date().getDate(),
      // endYear: new Date().getFullYear(),
      // endMonth: new Date().getMonth(),
      // endDay: new Date().getDate(),
      startYear: '',
      startMonth: '',
      startDay: '',
      endYear: '',
      endMonth: '',
      endDay: '',
      readOnly: false
    };

    this.getValidatorData = this.getValidatorData.bind(this);
    this.getClasses = this.getClasses.bind(this);
    this.validatorTypes = strategy.createSchema(
      {
        title: 'required',
        description: 'required',
        level3Competency: 'required',
        skills: 'required',
        importance: 'required',
        startYear: 'required',
        startMonth: 'required',
        startDay: 'required',
        endYear: 'required',
        endMonth: 'required',
        endDay: 'required'
      },
      {
        'required.title': validationMessages.title.required,
        'required.description': validationMessages.description.required,
        'required.level3Competency': validationMessages.competency.required,
        'required.skills': validationMessages.skills.required,
        'required.importance': validationMessages.importance.required,

        'required.startYear': validationMessages.year.required,
        'required.startMonth': validationMessages.month.required,
        'required.startDay': validationMessages.day.required,
        'required.endYear': validationMessages.year.required,
        'required.endMonth': validationMessages.month.required,
        'required.endDay': validationMessages.day.required
      }
    );
  }

  closeAchievementyModal = status => {
    badgeImgArray = [];
    badgeImgPreview = [];
    certificateImgArray = [];
    certificateImgPreview = [];
    mediaImgArray = [];
    mediaImgPreview = [];
    this.setState({
      achievementModal: false,
      badgeImgArray: [],
      badgeImgPreview: [],
      certificateImgArray: [],
      certificateImgPreview: [],
      mediaImgArray: [],
      mediaImgPreview: [],
      type: ''
    });

    if (this.props.type == 1) {
      this.props.closeAchievementModal('', '', this.props.competencyTypeId);
    }

    // if (status === 'save') {
    //   this.props.closeSaveAchievementComponent(this.props.competencyTypeId);
    // } else if (status === 'close') {
    //   this.props.closeAchievementComponent(this.props.competencyTypeId);
    // }
  };

  getValidatorData = () => {
    return this.state;
  };

  getClasses = field => {
    return classnames({
      error: !this.props.isValid(field)
    });
  };

  componentDidMount() {
    this.getAllSkills();
    this.getAllImportance();
    this.setAchievementData(this.props.achievementRow);
    this.generateSASToken();
    if (this.props.levelThreeCompetency) {
      this.setState(
        {
          levelThreeCompetency: this.props.levelThreeCompetency,
          competencyTypeId: this.props.competencyTypeId,
          userId: this.props.userId,
          level2Competency: this.props.level2Competency,
          type: Number(this.props.type)
        },
        () => {
          if (this.competencyDropdown) {
            this.competencyDropdown.click();
          }
        }
      );
    }
  }

  setAchievementData = data => {
    let skills = [];
    let startDay = '',
      startMonth = '',
      startYear = '',
      endDay = '',
      endMonth = '',
      endYear = '',
      todaysDate = '';
    if (data) {
      if (data.skills && data.skills.length > 0) {
        skills = data.skills.map(function(skill) {
          return { value: skill.skillId, label: skill.label };
        });
      }

      // if (data.badge && data.badge.length > 0) {
      //   badgeImgPreview = data.badge.map(function(badge) {
      //     let badgeName = `${CONSTANTS.azureBlobURI}/${
      //       CONSTANTS.azureContainer
      //     }/${badge}`;
      //     return badgeName;
      //   });

      //   badgeImgArray = data.badge.map(function(badge) {
      //     let badgeName = `${CONSTANTS.azureBlobURI}/${
      //       CONSTANTS.azureContainer
      //     }/${badge}`;
      //     return badgeName;
      //   });
      // }

      // if (data.certificate && data.certificate.length > 0) {
      //   certificateImgPreview = data.certificate.map(function(certificate) {
      //     let certificateName = `${CONSTANTS.azureBlobURI}/${
      //       CONSTANTS.azureContainer
      //     }/${certificate}`;
      //     return certificateName;
      //   });

      //   certificateImgArray = data.certificate.map(function(certificate) {
      //     let certificateName = `${CONSTANTS.azureBlobURI}/${
      //       CONSTANTS.azureContainer
      //     }/${certificate}`;
      //     return certificateName;
      //   });
      // }

      if (data.asset && data.asset.length > 0) {
        data.asset.map(function(asset) {
          let mediaName = `${CONSTANTS.azureBlobURI}/${
            CONSTANTS.azureContainer
          }/${asset.file}`;

          mediaImgPreview.push({
            file: mediaName,
            tag: asset.tag,
            type: asset.type
          });
        });

        data.asset.map(function(asset) {
          let mediaName = `${CONSTANTS.azureBlobURI}/${
            CONSTANTS.azureContainer
          }/${asset.file}`;

          mediaImgArray.push({
            file: mediaName,
            tag: asset.tag,
            type: asset.type
          });
        });
      }

      if (data.fromDate) {
        var fromDate = new Date(data.fromDate);
        startDay = fromDate.getDate();
        startMonth = fromDate.getMonth();
        startYear = fromDate.getFullYear();

        // startDay = moment(data.fromDate).format('D');
        // startMonth = moment(data.fromDate).format('M');
        // startYear = moment(data.fromDate).format('YYYY');
      }

      if (data.toDate) {
        var toDate = new Date(data.toDate);
        endDay = toDate.getDate();
        endMonth = toDate.getMonth();
        endYear = toDate.getFullYear();
        // endDay = moment(data.toDate).format('D');
        // endMonth = moment(data.toDate).format('M');
        // endYear = moment(data.toDate).format('YYYY');
      } else {
        todaysDate = '';
        this.validatorTypes.rules['endDay'] = '';
        this.validatorTypes.rules['endMonth'] = '';
        this.validatorTypes.rules['endYear'] = '';
      }

      this.setState({
        achievementId: data.achievementId,
        competencyTypeId: data.competencyTypeId,
        level3Competency: data.level3Competency,
        userId: data.userId,
        title: data.title,
        description: data.description,
        importance: Number(data.importance),
        fromDate: fromDate,
        toDate: toDate,
        startDay: startDay,
        startMonth: startMonth,
        startYear: startYear,
        endDay: endDay,
        endMonth: endMonth,
        endYear: endYear,
        //startDate: moment(data.fromDate),
        // endDate: data.toDate ? moment(data.toDate) : emptyToDate,
        skills,
        todaysDate: data.toDate ? false : true,
        // badgeImgPreview,
        // badgeImgArray,
        //certificateImgPreview,
        // certificateImgArray,
        mediaImgPreview,
        mediaImgArray
      });

      if (data.guide) {
        if (data.guide.promptRecommendation === true) {
          this.setState({
            readOnly: true
          });
        }
        this.setState({
          firstName: data.guide.firstName,
          lastName: data.guide.lastName,
          email: data.guide.email,
          promptRecommendation: data.guide.promptRecommendation,
          dbPromptRecommendation: data.guide.promptRecommendation
        });
      }
    }
  };

  getAllSkills() {
    spikeViewApiService('getSkills')
      .then(response => {
        if (response.data.status === 'Success') {
          let skillsList = response.data.result || [];
          let skillOptions = skillsList.map(function(skillObj) {
            return {
              value: skillObj.skillId,
              label: skillObj.title
            };
          });
          this.setState({ skillList: skillOptions });
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

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

  handleChange = event => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  handleChangeStart = startDate => {
    this.handleDateChange({ startDate });
  };

  handleChangeEnd = endDate => {
    this.handleDateChange({ endDate });
  };

  handleDateChange = ({ startDate, endDate }) => {
    startDate = startDate || this.state.startDate;
    endDate = endDate || this.state.endDate;
    if (startDate && endDate) {
      if (startDate.isAfter(endDate)) {
        endDate = startDate;
      }
    }
    this.setState({ startDate, endDate });
  };

  handleSkillChange = newValue => {
    this.setState({
      skills: newValue
    });
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

  validateData = () => {
    let self = this;

    if (this.state.promptRecommendation === true) {
      this.validatorTypes.rules['firstName'] = [
        'required',
        'regex:' + regExpressions.alphaOnly
      ];
      this.validatorTypes.messages['required.firstName'] =
        validationMessages.firstName.required;

      this.validatorTypes.messages['regex.firstName'] =
        validationMessages.firstName.alphaOnly;

      this.validatorTypes.rules['lastName'] = [
        'required','regex:' + regExpressions.alphaOnly
      ];

      this.validatorTypes.messages['required.lastName'] =
      validationMessages.lastName.required;

      this.validatorTypes.messages['regex.lastName'] =
        validationMessages.lastName.alphaOnly;

      this.validatorTypes.rules['email'] = 'required|email';
      this.validatorTypes.messages['required.email'] =
        validationMessages.email.required;
      this.validatorTypes.messages['email.email'] =
        validationMessages.email.invalid;
    } else if (this.state.firstName || this.state.lastName || this.state.email) {
      this.validatorTypes.rules['firstName'] = [
        'required',
        'regex:' + regExpressions.alphaOnly
      ];
      this.validatorTypes.messages['required.firstName'] =
        validationMessages.firstName.required;

      this.validatorTypes.rules['lastName'] = [
        'required','regex:' + regExpressions.alphaOnly
      ];

      this.validatorTypes.messages['required.lastName'] =
      validationMessages.lastName.required;

      this.validatorTypes.messages['regex.lastName'] =
        validationMessages.lastName.alphaOnly;

      this.validatorTypes.messages['regex.firstName'] =
        validationMessages.firstName.alphaOnly;

      this.validatorTypes.rules['email'] = 'required|email';
      this.validatorTypes.messages['required.email'] =
        validationMessages.email.required;
      this.validatorTypes.messages['email.email'] =
        validationMessages.email.invalid;
    } else {
      this.validatorTypes.rules['firstName'] = '';
      this.validatorTypes.messages['required.firstName'] = '';
      this.validatorTypes.messages['regex.firstName'] = '';
      this.validatorTypes.messages['regex.lastName'] = '';
      this.validatorTypes.rules['email'] = '';
      this.validatorTypes.messages['required.email'] = '';
    }
    let today = new Date();

    this.props.validate(function(error) {
      let imageObject = {
        media: self.state.mediaImgArray || []
      };

      if (!error) {
        if (
          self.state.fromDate &&
          self.state.fromDate > today &&
          (self.state.toDate && self.state.toDate > today)
        ) {
          showErrorToast(
            '"From" and "To" date should be less than future date'
          );
          self.setState({
            startYear: '',
            startMonth: '',
            startDay: '',
            endYear: '',
            endMonth: '',
            endDay: ''
          });
        } else if (self.state.fromDate && self.state.fromDate > today) {
          showErrorToast('"From" date should be less than future date');
          self.setState({
            startYear: '',
            startMonth: '',
            startDay: ''
          });
        } else if (self.state.toDate && self.state.toDate > today) {
          showErrorToast('"To" date should be less than future date');
          self.setState({
            endYear: '',
            endMonth: '',
            endDay: ''
          });
        } else if (
          self.state.fromDate !== '' &&
          self.state.toDate !== '' &&
          self.state.fromDate > self.state.toDate
        ) {
          showErrorToast(
            'The "to" date should be greater than or equal to "from" date'
          );
          self.setState({
            endYear: '',
            endMonth: '',
            endDay: ''
          });
        } else {
          self.setState({ isLoading: true });
          if (self.state.mediaImgArray.length > 0) {
            self.uploadAchievementData(imageObject);
            setTimeout(function() {
              self.handleSubmit();
            }, 3000);
          } else {
            self.handleSubmit();
          }
        }
      }
    });
  };

  selectStartDate = (type, value) => {
    if (type === 'startYear') {
      this.setState({ startYear: value }, () => this.selectDateChange());
    }
    if (type === 'startMonth') {
      this.setState({ startMonth: value }, () => this.selectDateChange());
    }
    if (type === 'startDay') {
      this.setState({ startDay: value }, () => this.selectDateChange());
    }
  };

  selectEndDate = (type, value) => {
    if (type === 'endYear') {
      this.setState({ endYear: value }, () => this.selectDateChange());
    }
    if (type === 'endMonth') {
      this.setState({ endMonth: value, endDay: '' }, () =>
        this.selectDateChange()
      );
    }
    if (type === 'endDay') {
      this.setState({ endDay: value }, () => this.selectDateChange());
    }
  };

  selectDateChange = () => {
    let fromDate = '';
    let toDate = '';
    let startDay = '',
      startYear = '',
      startMonth = '',
      endDay = '',
      endMonth = '',
      endYear = '';

    console.log('startYear', this.state.startYear);
    console.log('startMonth', this.state.startMonth);
    console.log('startDay', this.state.startDay);
    console.log('endYear', this.state.endYear);
    console.log('endMonth', this.state.endMonth);
    console.log('endDay', this.state.endDay);

    if (this.state.startYear && this.state.startMonth && this.state.startDay) {
      startDay = this.state.startDay !== '' ? this.state.startDay : '';
      startMonth = this.state.startMonth !== '' ? this.state.startMonth : '';
      startYear = this.state.startYear !== '' ? this.state.startYear : '';
      fromDate = new Date(startYear, startMonth, startDay);
      console.log('fromDate', fromDate);
      this.setState({
        fromDate
      });
      //if (fromDate && fromDate > today) {
      //   showErrorToast('From date should be less than future date');
      //   this.setState({
      //     startYear: '',
      //     startMonth: '',
      //     startDay: ''
      //     // startYear: new Date().getFullYear(),
      //     // startMonth: new Date().getMonth(),
      //     // startDay: new Date().getDate()
      //   });
      // } else {
      //   this.setState({
      //     fromDate,
      //     startYear,
      //     startMonth,
      //     startDay
      //   });
      // }
    }

    if (this.state.endYear && this.state.endMonth && this.state.endDay) {
      endDay = this.state.endDay !== '' ? this.state.endDay : '';
      endMonth = this.state.endMonth !== '' ? this.state.endMonth : '';
      endYear = this.state.endYear !== '' ? this.state.endYear : '';
      toDate = new Date(endYear, endMonth, endDay);
      console.log('toDate', toDate);
      this.setState({
        toDate
      });

      // if (toDate && toDate > today) {
      //   showErrorToast('To date should be less than future date');
      //   this.setState({
      //     // endYear: new Date().getFullYear(),
      //     // endMonth: new Date().getMonth(),
      //     // endDay: new Date().getDate()
      //     endYear: '',
      //     endMonth: '',
      //     endDay: ''
      //   });
      // } else {
      //   this.setState({
      //     toDate,
      //     endYear,
      //     endMonth,
      //     endDay
      //   });
      // }
    }
  };

  //   if (fromDate > toDate) {
  //     showErrorToast('The "to" date should be greater than "from"');
  //     this.setState({
  //       endDay: startDay,
  //       endMonth: startMonth,
  //       endYear: startYear,
  //       fromDate,
  //       toDate
  //     });
  //   } else {
  //     this.setState({
  //       fromDate,
  //       toDate
  //     });
  //   }
  // } else {
  //   this.setState({
  //     fromDate,
  //     toDate
  //   });
  // }

  // validateData = () => {
  //   let self = this;
  //   badgeImgArray = [];
  //   certificateImgArray = [];
  //   mediaImgArray = [];

  //   this.props.validate(function(error) {
  //     let imageArray = self.state.mediaImgArray;
  //     // if (imageArray.length > 0) {
  //     //   imageArray.map(
  //     //     (image, index) =>
  //     //       image.tag === CONSTANTS.badgeAlbum
  //     //         ? badgeImgArray.push(image.file)
  //     //         : image.tag === CONSTANTS.certificateAlbum
  //     //           ? certificateImgArray.push(image.file)
  //     //           : image.tag === CONSTANTS.mediaAlbum
  //     //             ? mediaImgArray.push(image.file)
  //     //             : ''
  //     //   );
  //     // }

  //     let imageObject = {
  //       // badge: badgeImgArray || [],
  //       //  certificate: certificateImgArray || [],
  //       media: mediaImgArray || []
  //     };

  //     if (!error) {
  //       self.setState({ isLoading: true });
  //       if (imageArray.length > 0) {
  //         self.uploadAchievementData(imageObject);
  //         setTimeout(function() {
  //           self.handleSubmit();
  //         }, 5000);
  //       } else {
  //         self.handleSubmit();
  //       }
  //     }
  //   });
  // };

  handleSubmit() {
    let achievementId = this.state.achievementId;
    let isActive= true;
    let competencyTypeId = this.state.competencyTypeId;
    let level2Competency = this.state.level2Competency;
    let level3Competency = this.state.level3Competency;
    let userId = this.state.userId;
    let title = this.state.title;
    let description = this.state.description;
    let importance = Number(this.state.importance);

    let startDay = this.state.startDay !== '' ? this.state.startDay : '';
    let startMonth = this.state.startMonth !== '' ? this.state.startMonth : '';
    let startYear = this.state.startYear !== '' ? this.state.startYear : '';
    let fromDate = '';
    if (startDay && startMonth && startYear) {
      fromDate = new Date(startYear, startMonth, startDay);
      fromDate = fromDate.valueOf();
    }

    let endDay = this.state.endDay !== '' ? this.state.endDay : '';
    let endMonth = this.state.endMonth !== '' ? this.state.endMonth : '';
    let endYear = this.state.endYear !== '' ? this.state.endYear : '';
    let toDate = '';
    if (endDay && endMonth && endYear) {
      toDate = new Date(endYear, endMonth, endDay);
      toDate = toDate.valueOf();
      toDate = this.state.todaysDate ? '' : toDate;
    }

    let badge = this.state.badgesData.length > 0 ? this.state.badgesData : [];
    let certificate =
      this.state.certificatesData.length > 0 ? this.state.certificatesData : [];
    let asset = this.state.mediaData.length > 0 ? this.state.mediaData : [];
    let guide;
    if (this.state.dbPromptRecommendation === true) {
      guide = {};
    } else {
      guide = {
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        email: this.state.email,
        promptRecommendation: this.state.promptRecommendation
      };
    }
    let skills = [];
    if (this.state.skills.length > 0) {
      skills = this.state.skills.map(function(skill) {
        return { skillId: skill.value, label: skill.label };
      });
    }

    let data = {
      achievementId,
      competencyTypeId,
      level2Competency,
      level3Competency,
      userId,
      title,
      description,
      importance,
      fromDate,
      toDate,
      skills,
      guide,
      badge,
      certificate,
      asset,
      isActive
    };

    console.log(data);

    let self = this;
    if (this.state.achievementId === '') {
      spikeViewApiService('addAchievement', data)
        .then(response => {
          if (response.data.status === 'Success') {
            // if (this.state.type === 1) {
            //   this.props.closeAchievementComponent();
            // } else {
            //   self.closeAchievementyModal('save');
            // }

            self.props.getAchievementsByUser();
            if (self.props.addType === 'competencyModal') {
              setTimeout(function() {
                self.props.closeAchievementComponent(1);
                self.setState({ isLoading: false, achievementModal: false });
              }, 500);
            } else {
              self.props.closeAchievementComponent();
              self.props.showConfirmBox();
              self.setState({ isLoading: false, achievementModal: false });
            }
          }
        })
        .catch(error => {
          self.setState({ isLoading: false });
          console.log(error);
        });
    } else {
      spikeViewApiService('editAchievement', data)
        .then(response => {
          if (response.data.status === 'Success') {
            self.props.getAchievementsByUser();
            self.closeAchievementyModal('save');
            self.setState({ isLoading: false, achievementModal: false });
          }
        })
        .catch(error => {
          self.setState({ isLoading: false });
          console.log(error);
        });
    }
  }

  closeImageModal = () => {
    this.setState({
      imagesModal: !this.state.imagesModal
    });
  };

  // handleBadgeChange = event => {
  //   let badgeImgArray = this.state.badgeImgArray;
  //   let badgeImgPreview = this.state.badgeImgPreview;
  //   let file = event.target.files[0];
  //   if (file) {
  //     let reader = new FileReader();
  //     reader.readAsDataURL(event.target.files[0]);
  //     reader.onload = event => {
  //       badgeImgArray.push(file);
  //       badgeImgPreview.push(event.target.result);
  //       this.setState({
  //         badgeImgPreview,
  //         badgeImgArray
  //       });
  //     };
  //     if (badgeImgPreview.length === 3) {
  //       document.getElementById('badge_2').classList.add('img-count--wrapper');
  //     }
  //   }
  // };

  // handleCertificateChange = event => {
  //   let certificateImgArray = this.state.certificateImgArray;
  //   let certificateImgPreview = this.state.certificateImgPreview;
  //   let file = event.target.files[0];
  //   if (file) {
  //     let reader = new FileReader();
  //     reader.readAsDataURL(event.target.files[0]);
  //     reader.onload = event => {
  //       certificateImgArray.push(file);
  //       certificateImgPreview.push(event.target.result);
  //       this.setState({
  //         certificateImgArray,
  //         certificateImgPreview
  //       });
  //     };

  //     if (certificateImgPreview.length === 3) {
  //       document
  //         .getElementById('certificate_2')
  //         .classList.add('img-count--wrapper');
  //     }
  //   }
  // };

  // handleMediaChange = (event, imageTag) => {
  //   let mediaImgArray = this.state.mediaImgArray;
  //   let mediaImgPreview = this.state.mediaImgPreview;
  //   let file = event;

  //   // console.log(mediaImgArray);
  //   // console.log(mediaImgPreview);
  //   // console.log(file);
  //   // console.log(imageTag);
  //   // if (file) {
  //   //   var fileType = file.type.split('/');
  //   //   let reader = new FileReader();
  //   //   reader.readAsDataURL(event);
  //   //   reader.onload = event => {
  //   //     if (fileType[0] === 'image') {
  //   //       mediaImgArray.push(file);
  //   //       mediaImgPreview.push({ source: event.target.result, type: 'image' });
  //   //     } else if (fileType[0] === 'video') {
  //   //       mediaImgArray.push(file);
  //   //       mediaImgPreview.push({ source: file, type: 'video' });
  //   //     }

  //   //     this.setState({
  //   //       mediaImgArray,
  //   //       mediaImgPreview
  //   //     });
  //   //   };

  //   //   if (mediaImgPreview.length === 3) {
  //   //     document.getElementById('media_2').classList.add('img-count--wrapper');
  //   //   }
  //   // }
  // };

  // deleteBadge = (index, imageIndex) => {
  //   let badgeImgArray = this.state.badgeImgArray;
  //   let badgeImgPreview = this.state.badgeImgPreview;
  //   badgeImgPreview.splice(index, 1);
  //   badgeImgArray.splice(index, 1);
  //   this.setState({
  //     badgeImgArray,
  //     badgeImgPreview
  //   });
  //   if (badgeImgPreview.length === 0) {
  //     this.closeImageModal();
  //   }
  // };

  // deleteCertificate = index => {
  //   let certificateImgArray = this.state.certificateImgArray;
  //   let certificateImgPreview = this.state.certificateImgPreview;
  //   certificateImgPreview.splice(index, 1);
  //   certificateImgArray.splice(index, 1);
  //   this.setState({
  //     certificateImgArray,
  //     certificateImgPreview
  //   });
  //   if (certificateImgPreview.length === 0) {
  //     this.closeImageModal();
  //   }
  // };

  deleteMedia = index => {
    let mediaImgArray = this.state.mediaImgArray;
    let mediaImgPreview = this.state.mediaImgPreview;
    mediaImgPreview.splice(index, 1);
    mediaImgArray.splice(index, 1);
    this.setState({
      mediaImgArray,
      mediaImgPreview
    });
    if (mediaImgPreview.length === 0) {
      this.closeImageModal();
    }
  };

  uploadAchievementData(mediaObject) {
    let AzureStorage = window.AzureStorage;
    let sasToken = this.state.sasToken;
    let userId = this.state.userId;
    // let badgesData = [];
    //  let certificatesData = [];
    let mediaData = [];
    let self = this;
    const blobService = AzureStorage.Blob.createBlobServiceWithSas(
      CONSTANTS.azureBlobURI,
      sasToken
    );

    function uploadFiles(uploadArray, albumName) {
      for (var index = 0; index < uploadArray.length; index++) {
        if (isValidURL(uploadArray[index].file) === true) {
          let path = `${CONSTANTS.azureBlobURI}/${CONSTANTS.azureContainer}/`;
          // if (albumName === CONSTANTS.badgeAlbum) {
          //   let imageName = uploadArray[index].replace(path, '');
          //   badgesData.push(imageName);
          // }

          // if (albumName === CONSTANTS.certificateAlbum) {
          //   let imageName = uploadArray[index].replace(path, '');
          //   certificatesData.push(imageName);
          // }

          if (albumName === CONSTANTS.mediaAlbum) {
            let imageName = uploadArray[index].file.replace(path, '');

            mediaData.push({
              file: imageName,
              tag: uploadArray[index].tag,
              type: uploadArray[index].type
            });
          }
        } else {
          let fileName = generateTimestamp(uploadArray[index].file.name);

          let uploadPath = `sv_${userId}/${albumName}/${fileName}`;

          // if (albumName === CONSTANTS.badgeAlbum) {
          //   badgesData.push(uploadPath);
          // }

          // if (albumName === CONSTANTS.certificateAlbum) {
          //   certificatesData.push(uploadPath);
          // }

          if (albumName === CONSTANTS.mediaAlbum) {
            mediaData.push({
              file: uploadPath,
              tag: uploadArray[index].tag,
              type: uploadArray[index].type
            });
          }

          blobService.createBlockBlobFromBrowserFile(
            CONSTANTS.azureContainer,
            uploadPath,
            uploadArray[index].file,
            (error, result) => {
              if (result) {
                console.log(result);
              }
              if (error) {
                console.log('error ', error);
              }
            }
          );
        }
      }

      // if (albumName === CONSTANTS.badgeAlbum) {
      //   self.setState({ badgesData: badgesData });
      // }

      // if (albumName === CONSTANTS.certificateAlbum) {
      //   self.setState({ certificatesData });
      // }

      if (albumName === CONSTANTS.mediaAlbum) {
        self.setState({ mediaData });
      }
    }
    //uploadFiles(mediaObject.badge, CONSTANTS.badgeAlbum);
    //uploadFiles(mediaObject.certificate, CONSTANTS.certificateAlbum);
    uploadFiles(mediaObject.media, CONSTANTS.mediaAlbum);
  }

  handleImageChange = (action, event) => {
    this.setState({ imageSource: '' });
    const file = event.target.files[0];
    const fileName = file.name;
    const fileType = file.type;
    if (file) {
      var Type = fileType.split('/');
      if (Type[0] === 'image') {
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

      if (Type[0] === 'video') {
        this.handleMediaChange(file, CONSTANTS.mediaAlbum);
      }
    }
  };

  handleMediaChange = (event, imageTag) => {
    let mediaImgArray = this.state.mediaImgArray;
    let mediaImgPreview = this.state.mediaImgPreview;

    let file = event;
    if (mediaImgPreview.length <= 9) {
      if (file) {
        var fileType = file.type.split('/');
        let reader = new FileReader();
        reader.readAsDataURL(event);
        reader.onload = event => {
          if (fileType[0] === 'image') {
            mediaImgArray.push({ file: file, tag: imageTag, type: 'image' });
            mediaImgPreview.push({
              file: event.target.result,
              type: 'image',
              tag: imageTag
            });
          } else if (fileType[0] === 'video') {
            mediaImgArray.push({ file: file, tag: imageTag, type: 'video' });
            mediaImgPreview.push({
              file: achievementDefaultImage,
              type: 'video',
              tag: imageTag
            });
          }

          this.setState({
            mediaImgArray,
            mediaImgPreview
          });
        };

        if (mediaImgPreview.length === 3) {
          document
            .getElementById('media_2')
            .classList.add('img-count--wrapper');
        }
      }
    } else {
      showErrorToast("You can't upload more than 10 images");
    }
  };

  currentCheckBox = event => {
    if (event.target.checked) {
      this.validatorTypes.rules['endDay'] = '';
      this.validatorTypes.rules['endMonth'] = '';
      this.validatorTypes.rules['endYear'] = '';
      this.setState({
        toDate: '',
        todaysDate: true,
        endDay: '',
        endMonth: '',
        endYear: ''
      });
    } else {
      this.validatorTypes.rules['endDay'] = 'required';
      this.validatorTypes.messages['required.endDay'] =
        validationMessages.day.required;

      this.validatorTypes.rules['endMonth'] = 'required';
      this.validatorTypes.messages['required.endMonth'] =
        validationMessages.month.required;

      this.validatorTypes.rules['endYear'] = 'required';
      this.validatorTypes.messages['required.endYear'] =
        validationMessages.year.required;

      this.setState({
        todaysDate: false,
        endYear: '',
        endMonth: '',
        endDay: ''
        // endYear: new Date().getFullYear(),
        // endMonth: new Date().getMonth(),
        // endDay: new Date().getDate()
        // endYear: moment().format('YYYY'),
        // endMonth: moment().format('M') - 1,
        // endDay: moment().format('D')
      });
    }

    // let endDate = null;
    // if (!todaysDate) endDate = emptyToDate;
    // else endDate = '';
    // this.setState({ todaysDate: !todaysDate, endDate: endDate });
  };

  render() {
    return (
      <React.Fragment>
        <Modal
          bsSize="large"
          show={this.state.achievementModal}
          onHide={this.closeAchievementyModal.bind(this, 'close')}
          backdrop="static"
          keyboard={false}
        >
          {/* <ToastContainer
            autoClose={5000}
            className="custom-toaster-main-cls"
            toastClassName="custom-toaster-bg"
            transition={ZoomInAndOut}
          /> */}
          <Modal.Header closeButton>
            <Modal.Title className="subtitle text-center">
              {this.state.achievementId === ''
                ? 'Add Achievement'
                : 'Edit Achievement'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.state.imageSource ? (
              <ImageCropper
                imageSource={this.state.imageSource}
                imageName={this.state.imageName}
                imageType={this.state.imageType}
                aspectRatio={16 / 9}
                modalSize={'medium'}
                cropBoxWidth={this.state.action === 1 ? '300' : '700'}
                cropBoxHeight={this.state.action === 1 ? '300' : '700'}
                uploadImageToAzure={this.handleMediaChange.bind(this)}
                labelName={'ADD_MEDIA'}
              />
            ) : null}

            <Form horizontal className="lightBgForm">
              <Col sm={10}>
                <FormGroup
                  controlId="formControlsTextarea"
                  className={this.getClasses('title')}
                >
                  <Col componentClass={ControlLabel} sm={3}>
                    <ControlLabel>Title</ControlLabel>
                  </Col>
                  <Col sm={9}>
                    <FormControl
                      placeholder="Add a cool title for your achievement"
                      name="title"
                      value={this.state.title}
                      onChange={this.handleChange}
                      autoComplete="off"
                      maxLength="100"
                    />
                    {renderMessage(this.props.getValidationMessages('title'))}
                  </Col>
                </FormGroup>
                <FormGroup
                  controlId="formControlsTextarea"
                  className={this.getClasses('description')}
                >
                  <Col componentClass={ControlLabel} sm={3}>
                    <ControlLabel>Description</ControlLabel>
                  </Col>
                  <Col sm={9}>
                    <FormControl
                      componentClass="textarea"
                      placeholder="Tell us how this made you unique"
                      name="description"
                      value={this.state.description}
                      onChange={this.handleChange}
                      autoComplete="off"
                      maxLength="1000"
                    />
                    {renderMessage(
                      this.props.getValidationMessages('description')
                    )}
                  </Col>
                </FormGroup>
                <FormGroup className={this.getClasses('level3Competency')}>
                  <Col componentClass={ControlLabel} sm={3}>
                    Competency
                  </Col>
                  <Col sm={9}>
                    <div className="custom-select">
                      <span className="icon-down_arrow selectIcon" />
                      <FormControl
                        componentClass="select"
                        placeholder="Select Competency"
                        name="level3Competency"
                        value={this.state.level3Competency}
                        onChange={this.handleChange}
                        onClick={this.handleChange}
                        inputRef={element => {
                          this.competencyDropdown = element;
                        }}
                      >
                        {this.state.levelThreeCompetency.length > 0
                          ? this.state.levelThreeCompetency.length === 1
                            ? this.state.levelThreeCompetency.map(
                                (item, index) => (
                                  <option
                                    value={item._id || item.key}
                                    key={index}
                                  >
                                    {item.name}
                                  </option>
                                )
                              )
                            : [
                                <option value="">
                                  Select your focus area for this achievement
                                </option>,
                                this.state.levelThreeCompetency.map(
                                  (item, index) => (
                                    <option
                                      value={item._id || item.key}
                                      key={index}
                                    >
                                      {item.name}
                                    </option>
                                  )
                                )
                              ]
                          : ''}
                      </FormControl>
                    </div>
                    {renderMessage(
                      this.props.getValidationMessages('level3Competency')
                    )}
                  </Col>
                </FormGroup>
                <FormGroup className={this.getClasses('skills')}>
                  <Col componentClass={ControlLabel} sm={3}>
                    Skills
                  </Col>
                  <Col sm={9}>
                    <div className="custom-select">
                      <span className="icon-down_arrow selectIcon" />
                      <Select
                        className="form-control"
                        multi
                        name="skills"
                        value={this.state.skills}
                        onChange={this.handleSkillChange}
                        options={this.state.skillList}
                        placeholder="Select all the abilities that you used along the way"
                      />
                    </div>
                    {renderMessage(this.props.getValidationMessages('skills'))}
                  </Col>
                </FormGroup>
                <FormGroup className={this.getClasses('importance')}>
                  <Col componentClass={ControlLabel} sm={3}>
                    Achievement Level
                  </Col>
                  <Col sm={9}>
                    <div className="custom-select">
                      <span className="icon-down_arrow selectIcon" />
                      <FormControl
                        componentClass="select"
                        placeholder="Select Importance"
                        name="importance"
                        value={this.state.importance}
                        onChange={this.handleChange}
                      >
                        <option value="">Select Achievement Level</option>
                        {this.state.importanceList.length > 0
                          ? this.state.importanceList.map((imp, j) => (
                              <option value={imp.importanceId} key={j}>
                                {imp.title}
                              </option>
                            ))
                          : ''}
                      </FormControl>
                    </div>
                    {renderMessage(
                      this.props.getValidationMessages('importance')
                    )}
                  </Col>
                </FormGroup>
                <FormGroup className="addDateInput">
                  <Col componentClass={ControlLabel} sm={3}>
                    Date From
                  </Col>
                  <Col sm={9}>
                    <div className="dob">
                      <div
                        className={`form-group ${this.getClasses('startYear')}`}
                      >
                        <YearPicker
                          id="year"
                          name="startYear"
                          classes="form-control"
                          defaultValue="Year"
                          end={moment().year()}
                          reverse
                          value={this.state.startYear}
                          onChange={year =>
                            this.selectStartDate('startYear', year)
                          }
                        />
                        {renderMessage(
                          this.props.getValidationMessages('startYear')
                        )}
                      </div>
                      <div
                        className={`form-group ${this.getClasses(
                          'startMonth'
                        )}`}
                      >
                        <MonthPicker
                          id="month"
                          name="startMonth"
                          classes="form-control"
                          defaultValue={'Month'}
                          short
                          endYearGiven
                          year={this.state.startYear}
                          value={this.state.startMonth}
                          onChange={month =>
                            this.selectStartDate('startMonth', month)
                          }
                        />
                        {renderMessage(
                          this.props.getValidationMessages('startMonth')
                        )}
                      </div>
                      <div
                        className={`form-group ${this.getClasses('startDay')}`}
                      >
                        <DayPicker
                          defaultValue="Day"
                          id="day"
                          name="startDay"
                          classes="form-control"
                          year={this.state.startYear}
                          month={this.state.startMonth}
                          endYearGiven
                          value={this.state.startDay}
                          onChange={day =>
                            this.selectStartDate('startDay', day)
                          }
                        />
                        {renderMessage(
                          this.props.getValidationMessages('startDay')
                        )}
                      </div>
                      {/* <div
                        className={`form-group ${this.getClasses('fromDate')}`}
                      >
                        {renderMessage(
                          this.props.getValidationMessages('fromDate')
                        )}
                      </div> */}
                    </div>

                    {/* {renderMessage(this.props.getValidationMessages('endDate'))} */}
                  </Col>
                </FormGroup>
                <FormGroup className="addDateInput">
                  <Col componentClass={ControlLabel} sm={3}>
                    Date To
                  </Col>
                  <Col sm={9}>
                    <div className="dob">
                      <div
                        className={`form-group ${this.getClasses('endYear')}`}
                      >
                        <YearPicker
                          id="year"
                          name="endYear"
                          disabled={this.state.todaysDate ? true : false}
                          classes="form-control"
                          defaultValue="Year"
                          end={moment().year()}
                          reverse
                          value={this.state.endYear}
                          onChange={year => this.selectEndDate('endYear', year)}
                        />
                        {renderMessage(
                          this.props.getValidationMessages('endYear')
                        )}
                      </div>
                      <div
                        className={`form-group ${this.getClasses('endMonth')}`}
                      >
                        <MonthPicker
                          id="month"
                          name="endMonth"
                          disabled={this.state.todaysDate ? true : false}
                          classes="form-control"
                          defaultValue={'Month'}
                          short
                          endYearGiven
                          year={this.state.endYear}
                          value={this.state.endMonth}
                          onChange={month =>
                            this.selectEndDate('endMonth', month)
                          }
                        />
                        {renderMessage(
                          this.props.getValidationMessages('endMonth')
                        )}
                      </div>
                      <div
                        className={`form-group ${this.getClasses('endDay')}`}
                      >
                        <DayPicker
                          defaultValue="Day"
                          id="day"
                          disabled={this.state.todaysDate ? true : false}
                          name="endDay"
                          classes="form-control"
                          year={this.state.endYear}
                          month={this.state.endMonth}
                          endYearGiven
                          value={this.state.endDay}
                          onChange={day => this.selectEndDate('endDay', day)}
                        />
                        {renderMessage(
                          this.props.getValidationMessages('endDay')
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Checkbox
                        className="checkbox-primary "
                        onClick={this.currentCheckBox.bind(this)}
                        defaultChecked={this.state.todaysDate ? true : false}
                      >
                        Present
                        <span className="check" />
                      </Checkbox>
                    </div>
                    {/* {renderMessage(this.props.getValidationMessages('endDate'))} */}
                  </Col>
                </FormGroup>
                {/* <FormGroup className="addDateInput">
                  <Col componentClass={ControlLabel} sm={3}>
                    Date
                  </Col>
                  <Col sm={9} className={this.getClasses('startDate')}>
                    <div className="flex row customDatePicker">
                      <Col sm={6}>
                        <div className="line-between-form-controls">
                          <InputGroup>
                            <DatePicker
                              popperContainer={CalendarContainer}
                              className="form-control"
                              maxDate={moment()}
                              selected={this.state.startDate}
                              selectsStart
                              startDate={this.state.startDate}
                              endDate={
                                this.state.endDate === emptyToDate
                                  ? ''
                                  : this.state.endDate
                              }
                              onChange={this.handleChangeStart}
                              //readOnly={true}
                              placeholderText="Date"
                              showYearDropdown
                              dateFormat="DD-MMM-YYYY"
                              isClearable={false}
                              dropdownMode={'scroll'}
                              scrollableYearDropdown={true}
                            />
                          </InputGroup>
                        </div>

                        {renderMessage(
                          this.props.getValidationMessages('startDate')
                        )}
                      </Col>

                      <Col sm={6} className={`${this.getClasses('endDate')}`}>
                        <div className="line-between-form-controls">
                          <InputGroup className="toPresentDatepicker border-r0">
                            <DatePicker
                              popperContainer={CalendarContainer}
                              maxDate={moment()}
                              className="form-control"
                              selected={
                                this.state.endDate === emptyToDate
                                  ? ''
                                  : this.state.endDate
                              }
                              selectsEnd
                              startDate={this.state.startDate}
                              endDate={
                                this.state.endDate === emptyToDate
                                  ? ''
                                  : this.state.endDate
                              }
                              onChange={this.handleChangeEnd}
                              disabled={this.state.todaysDate ? true : false}
                              placeholderText="To"
                              showYearDropdown
                              dateFormat="DD-MMM-YYYY" */}
                {/* <InputGroup.Addon>
                              <Checkbox
                                className="checkbox-primary "
                                onClick={this.currentCheckBox.bind(
                                  this,
                                  this.state.todaysDate
                                )}
                                defaultChecked={
                                  this.state.todaysDate ? true : false
                                }
                              >
                                present
                                <span className="check" />
                              </Checkbox>
                            </InputGroup.Addon>
                          </InputGroup>
                        </div>
                        {renderMessage(
                          this.props.getValidationMessages('endDate')
                        )}
                      </Col>
                    </div>
                  </Col>
                </FormGroup> */}
                {/* {this.state.achievementId ? ( */}
                <div>
                  <div className="flex align-center">
                    <Col componentClass={ControlLabel} sm={3}>
                      <strong>Teacher or Coach (Optional)</strong>
                    </Col>
                    <Col sm={9}>
                      <div className="border-line" />
                    </Col>
                  </div>

                  <FormGroup className={this.getClasses('firstName')}>
                    <Col componentClass={ControlLabel} sm={3}>
                      First Name
                    </Col>
                    <Col sm={9}>
                      <FormControl
                        type="text"
                        placeholder="First Name"
                        name="firstName"
                        value={this.state.firstName}
                        onChange={this.handleChange}
                        autoComplete="off"
                        maxLength="35"
                        readOnly={this.state.readOnly}
                      />
                      {renderMessage(
                        this.props.getValidationMessages('firstName')
                      )}
                    </Col>
                  </FormGroup>

                  <FormGroup className={this.getClasses('lastName')}>
                    <Col componentClass={ControlLabel} sm={3}>
                      Last Name
                    </Col>
                    <Col sm={9}>
                      <FormControl
                        type="text"
                        placeholder="Last Name"
                        name="lastName"
                        value={this.state.lastName}
                        onChange={this.handleChange}
                        autoComplete="off"
                        maxLength="35"
                        readOnly={this.state.readOnly}
                      />
                      {renderMessage(
                        this.props.getValidationMessages('lastName')
                      )}
                    </Col>
                  </FormGroup>

                  <FormGroup className={this.getClasses('email')}>
                    <Col componentClass={ControlLabel} sm={3}>
                      Email
                    </Col>
                    <Col sm={9}>
                      <FormControl
                        type="Email"
                        placeholder=" Email"
                        name="email"
                        value={this.state.email}
                        onChange={this.handleChange}
                        autoComplete="off"
                        readOnly={this.state.readOnly}
                      />
                      {renderMessage(this.props.getValidationMessages('email'))}
                    </Col>
                  </FormGroup>

                  <FormGroup>
                    <Col smOffset={3} sm={9}>
                      <Checkbox
                        className="checkbox-primary"
                        name="promptRecommendation"
                        onChange={this.handleChange}
                        checked={this.state.promptRecommendation}
                        disabled={this.state.readOnly === true ? true : false}
                      >
                        Prompt for recommendation on your behalf
                        <span className="check" />
                      </Checkbox>
                    </Col>
                  </FormGroup>
                </div>
                {/*<FormGroup className="flex align-center mb-0">
                  <Col componentClass={ControlLabel} sm={3}>
                    <strong>Upload Badges (Optional)</strong>
                  </Col>
                  <Col sm={9}>
                    <div className="border-line" />
                  </Col>
                </FormGroup>{' '}
                 <FormGroup>
                  <Col smOffset={3} sm={9}>
                    <div className="add-more-boxes--wrapper">
                      <div className="amb--item amb--item--images">
                        {this.state.badgeImgPreview.length > 0
                          ? this.state.badgeImgPreview.map((image, index) => (
                              <div
                                className={`amb-item--item ${
                                  index === 2 &&
                                  this.state.badgeImgPreview.length > 3
                                    ? 'img-count--wrapper'
                                    : ''
                                }`}
                                id={`badge_${index}`}
                                key={index}
                                style={
                                  index > 2
                                    ? { display: 'none' }
                                    : { display: 'block' }
                                }
                                onClick={this.closeImageModal.bind(this, 1)}
                              >
                                <img
                                  className="img-responsive"
                                  src={image}
                                  alt={index}
                                />

                                <a
                                  className="img-count--value"
                                  onClick={this.closeImageModal.bind(this, 1)}
                                >
                                  +{this.state.badgeImgPreview.length - 3}
                                </a>
                              </div>
                            ))
                          : ''}
                      </div>
                      <div className="amb--item">
                        <input
                          type="file"
                          accept="image/*"
                          value=""
                          onChange={this.handleBadgeChange.bind(this)}
                        />
                        <a
                          className="amb--item--link"
                          style={{ cursor: 'pointer' }}
                        >
                          {this.state.badgeImgPreview.length === 0
                            ? 'Add'
                            : 'Add More'}
                        </a>
                      </div>
                    </div>
                  </Col>
                </FormGroup> */}
                {/* <FormGroup className="flex align-center mb-0">
                  <Col componentClass={ControlLabel} sm={3}>
                    <strong>Upload Certificate (Optional)</strong>
                  </Col>
                  <Col sm={9}>
                    <div className="border-line" />
                  </Col>
                </FormGroup> */}
                {/* <FormGroup>
                  <Col smOffset={3} sm={9}>
                    <div className="add-more-boxes--wrapper">
                      <div className="amb--item amb--item--images">
                        {this.state.certificateImgPreview.length > 0
                          ? this.state.certificateImgPreview.map(
                              (image, index) => (
                                <div
                                  className={`amb-item--item ${
                                    index === 2 &&
                                    this.state.certificateImgPreview.length > 3
                                      ? 'img-count--wrapper'
                                      : ''
                                  }`}
                                  id={`certificate_${index}`}
                                  style={
                                    index > 2
                                      ? { display: 'none' }
                                      : { display: 'block' }
                                  }
                                  onClick={this.closeImageModal.bind(this, 2)}
                                >
                                  <img
                                    className="img-responsive"
                                    src={image}
                                    alt={index}
                                  />

                                  <a
                                    className="img-count--value"
                                    onClick={this.closeImageModal.bind(this, 2)}
                                  >
                                    +
                                    {this.state.certificateImgPreview.length -
                                      3}
                                  </a>
                                </div>
                              )
                            )
                          : ''}
                      </div>
                      <div className="amb--item">
                        <input
                          type="file"
                          accept="image/*"
                          value=""
                          onChange={this.handleCertificateChange.bind(this)}
                        />
                        <a
                          className="amb--item--link"
                          style={{ cursor: 'pointer' }}
                        >
                          {this.state.certificateImgPreview.length === 0
                            ? 'Add'
                            : 'Add More'}
                        </a>
                      </div>
                    </div>
                  </Col>
                </FormGroup> */}
                <div className="flex align-center mb-0">
                  <Col componentClass={ControlLabel} sm={3}>
                    <strong>Upload Media (Optional)</strong>
                  </Col>
                  <Col sm={9}>
                    <div className="border-line" />
                  </Col>
                </div>
                <FormGroup>
                  <Col smOffset={3} sm={9}>
                    <div className="add-more-boxes--wrapper withCaption">
                      <div className="amb--item amb--item--images">
                        {this.state.mediaImgPreview.length > 0
                          ? this.state.mediaImgPreview.map((image, index) => (
                              <div
                                className={`amb-item--item ${
                                  index === 2 &&
                                  this.state.mediaImgPreview.length > 3
                                    ? 'img-count--wrapper'
                                    : ''
                                }`}
                                id={`media_${index}`}
                                style={
                                  index > 2
                                    ? { display: 'none' }
                                    : { display: 'block' }
                                }
                                onClick={this.closeImageModal.bind(this)}
                              >
                                {image.type === 'image' ? (
                                  <img
                                    className="img-responsive"
                                    src={image.file}
                                    alt={index}
                                  />
                                ) : (
                                  <div>
                                    <span class="icon-video_tag icon lg-icon" />
                                  </div>
                                )}
                                <a
                                  className="img-count--value"
                                  onClick={this.closeImageModal.bind(this)}
                                >
                                  {index === 2 &&
                                  this.state.mediaImgPreview.length > 3
                                    ? `+ ${this.state.mediaImgPreview.length -
                                        3}`
                                    : ''}
                                </a>

                                <div className="caption_img">
                                  {image.tag === CONSTANTS.mediaAlbum
                                    ? 'General'
                                    : image.tag}
                                  {image.tag === CONSTANTS.certificateAlbum &&
                                  image.type === 'image' ? (
                                    <span className="icon-certificate" />
                                  ) : image.tag === CONSTANTS.badgeAlbum &&
                                  image.type === 'image' ? (
                                    <span className="icon-badges" />
                                  ) : image.tag === CONSTANTS.trophieAlbum &&
                                  image.type === 'image' ? (
                                    <span className="icon-trophy" />
                                  ) : (
                                    <span
                                      className={
                                        image.type === 'image'
                                          ? 'icon-image_tag'
                                          : 'icon-video_tag'
                                      }
                                    />
                                  )}
                                </div>
                              </div>
                            ))
                          : ''}
                      </div>

                      <div className="amb--item">
                        <input
                          type="file"
                          accept="image/*"
                          //accept="image/* video/*"
                          value=""
                          onChange={this.handleImageChange.bind(this, 1)}
                        />
                        <a
                          className="amb--item--link"
                          style={{ cursor: 'pointer' }}
                        >
                          {this.state.mediaImgPreview.length === 0
                            ? 'Add'
                            : 'Add More'}
                        </a>
                      </div>
                    </div>
                  </Col>
                </FormGroup>
              </Col>
              <div className="flex align-center justify-content-between fullWidth" />
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              bsStyle="primary"
              className="no-bold no-round"
              disabled={this.state.isLoading}
              onClick={!this.state.isLoading ? this.validateData : null}
            >
              {this.state.isLoading ? 'In Progress...' : 'Save'}
            </Button>
            <Button
              bsStyle="default"
              className="no-bold no-round"
              onClick={this.closeAchievementyModal.bind(this, 'close')}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          //  bsSize="medium"
          show={this.state.imagesModal}
          onHide={this.closeImageModal}
        >
          <Modal.Header closeButton>
            <Modal.Title className="subtitle text-center">
              Photos Gallery
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* {this.state.type === 1 ? (
              <MediaList
                imageArray={this.state.badgeImgPreview}
                deleteBadge={this.deleteBadge}
                closeImageModal={this.closeImageModal}
                uploadType={this.state.type}
              />
            ) : this.state.type === 2 ? (
              <MediaList
                imageArray={this.state.certificateImgPreview}
                deleteCertificate={this.deleteCertificate}
                closeImageModal={this.closeImageModal}
                uploadType={this.state.type}
              />
            ) : this.state.type === 3 ? ( */}
            <MediaList
              imageArray={this.state.mediaImgPreview}
              deleteMedia={this.deleteMedia}
              closeImageModal={this.closeImageModal}
            />
            {/* ) : (
              ''
            )} */}
          </Modal.Body>
          <Modal.Footer>
            {/* <Button bsStyle="primary no-bold no-round">Save</Button> */}
            <Button bstyle="default no-round" onClick={this.closeImageModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </React.Fragment>
    );
  }
}
addAchievement = validation(strategy)(addAchievement);
export default addAchievement;
