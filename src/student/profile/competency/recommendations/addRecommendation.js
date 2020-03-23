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
//import DatePicker from 'react-datepicker';
import { YearPicker, MonthPicker, DayPicker } from 'react-dropdown-date';
//import DatePicker from '../../../../assets/react-datepicker/es/index';
//import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import validation from 'react-validation-mixin';
import strategy from 'react-validatorjs-strategy';
import classnames from 'classnames';
import { connect } from 'react-redux';
import ImageCropper from '../../../../common/cropper/imageCropper';

import CONSTANTS from '../../../../common/core/config/appConfig';
import {
  renderMessage,
  isValidURL,
  showErrorToast,
  ZoomInAndOut,
  generateTimestamp,
  getThumbImage
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

class addRecommendation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      recommendationModal: true,
      levelThreeCompetency: [],
      skillList: [],
      title: '',
      request: '',
      skills: '',
      level3Competency: '',
      startDate: '',
      endDate: '',
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
      firstName: '',
      lastName: '',
      email: '',
      recommenderTitle: '',
      todaysDate: false,
      show: false,
      startYear: '',
      startMonth: '',
      startDay: '',
      endYear: '',
      endMonth: '',
      endDay: ''
      // startYear: moment().format('YYYY'),
      // startMonth: moment().format('M') - 1,
      // startDay: moment().format('D'),
      // endYear: moment().format('YYYY'),
      // endMonth: moment().format('M') - 1,
      // endDay: moment().format('D')
    };

    this.show = () => this.setState({ show: true });
    this.getValidatorData = this.getValidatorData.bind(this);
    this.getClasses = this.getClasses.bind(this);
    this.validatorTypes = strategy.createSchema(
      {
        firstName: ['required', 'regex:' + regExpressions.alphaOnly],
        lastName: ['required', 'regex:' + regExpressions.alphaOnly],
        email: 'required|email',
        title: 'required',
        request: 'required',
        level3Competency: 'required',
        skills: 'required',
        // startDate: 'required',
        // endDate: 'required',
        recommenderTitle: 'required',
        startYear: 'required',
        startMonth: 'required',
        startDay: 'required',
        endYear: 'required',
        endMonth: 'required',
        endDay: 'required'
      },
      {
        'required.title': validationMessages.title.required,
        'required.request': validationMessages.request.required,
        'required.level3Competency': validationMessages.competency.required,
        'required.skills': validationMessages.skills.required,
        // 'required.startDate': validationMessages.startDate.required,
        //   'required.endDate': validationMessages.endDate.required,
        'required.firstName': validationMessages.firstName.required,
        'regex.firstName': validationMessages.firstName.alphaOnly,
        'required.lastName': validationMessages.lastName.required,
        'regex.lastName': validationMessages.lastName.alphaOnly,
        'required.email': validationMessages.email.required,
        'email.email': validationMessages.email.invalid,
        'required.recommenderTitle':
          validationMessages.recommenderTitle.required,
        'required.startYear': validationMessages.year.required,
        'required.startMonth': validationMessages.month.required,
        'required.startDay': validationMessages.day.required,
        'required.endYear': validationMessages.year.required,
        'required.endMonth': validationMessages.month.required,
        'required.endDay': validationMessages.day.required
      }
    );
  }

  closeRecommendationModal = status => {
    badgeImgArray = [];
    badgeImgPreview = [];
    certificateImgArray = [];
    certificateImgPreview = [];
    mediaImgArray = [];
    mediaImgPreview = [];
    this.setState({
      recommendationModal: false,
      badgeImgArray: [],
      badgeImgPreview: [],
      certificateImgArray: [],
      certificateImgPreview: [],
      mediaImgArray: [],
      mediaImgPreview: []
    });

    if (this.props.type == 1) {
      this.props.closeRecommendationComponent(
        '',
        '',
        this.props.competencyTypeId
      );
    }

    if (status === 'save') this.props.closeSaveRecommendationComponent();
    else this.props.closeRecommendationComponent();
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
    this.generateSASToken();

    if (this.props.levelThreeCompetency) {
      this.setState(
        {
          levelThreeCompetency: this.props.levelThreeCompetency,
          competencyTypeId: this.props.competencyTypeId,
          userId: this.props.userId,
          level2Competency: this.props.level2Competency
        },
        () => {
          if (this.competencyDropdown) {
            this.competencyDropdown.click();
          }
        }
      );
    }
  }

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

  // validateData = () => {
  //   let self = this;
  //   this.props.validate(function(error) {
  //     let imageObject = {
  //       media: self.state.mediaImgArray || []
  //     };
  //     if (!error) {
  //       self.setState({ isLoading: true });
  //       if (self.state.mediaImgArray.length > 0) {
  //         self.uploadAchievementData(imageObject);
  //         setTimeout(function() {
  //           self.handleSubmit();
  //         }, 4000);
  //       } else {
  //         self.handleSubmit();
  //       }
  //     }
  //   });
  // };

  validateData = () => {
    let self = this;
    let today = new Date();
    this.props.validate(function(error) {
      let imageObject = {
        media: self.state.mediaImgArray || []
      };
      if (!error) {
        if (
          self.state.email.toLowerCase() === self.props.user.email.toLowerCase()
        ) {
          showErrorToast("You can not use your email as recommender's email");
        } else if (
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
            }, 4000);
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

    if (this.state.startYear && this.state.startMonth && this.state.startDay) {
      startDay = this.state.startDay !== '' ? this.state.startDay : '';
      startMonth = this.state.startMonth !== '' ? this.state.startMonth : '';
      startYear = this.state.startYear !== '' ? this.state.startYear : '';
      fromDate = new Date(startYear, startMonth, startDay);
      this.setState({
        fromDate
      });
    }

    if (this.state.endYear && this.state.endMonth && this.state.endDay) {
      endDay = this.state.endDay !== '' ? this.state.endDay : '';
      endMonth = this.state.endMonth !== '' ? this.state.endMonth : '';
      endYear = this.state.endYear !== '' ? this.state.endYear : '';
      toDate = new Date(endYear, endMonth, endDay);
      this.setState({
        toDate
      });
    }

    // if (toDate && fromDate) {
    //   if (fromDate > today) {
    //     showErrorToast('From  date should be less than future date');
    //     this.setState({
    //       startYear: moment().format('YYYY'),
    //       startMonth: moment().format('M') - 1,
    //       startDay: moment().format('D'),
    //       endYear: moment().format('YYYY'),
    //       endMonth: moment().format('M') - 1,
    //       endDay: moment().format('D')
    //     });
    //   } else if (toDate > today) {
    //     this.setState({
    //       startYear: moment().format('YYYY'),
    //       startMonth: moment().format('M') - 1,
    //       startDay: moment().format('D'),
    //       endYear: moment().format('YYYY'),
    //       endMonth: moment().format('M') - 1,
    //       endDay: moment().format('D')
    //     });
    //   } else if (fromDate > toDate) {
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
  };

  handleSubmit() {
    let competencyTypeId = this.state.competencyTypeId;
    let isActive= true;
    let level3Competency = this.state.level3Competency;
    let level2Competency = this.state.level2Competency;
    let userId = this.state.userId;
    let title = this.state.title;
    let request = this.state.request;
    let firstName = this.state.firstName || '';
    let lastName = this.state.lastName || '';
    let email = this.state.email.toLowerCase();
    let recommenderId = '';
    let stage = 'Requested';
    let name =
      this.props.user.firstName || '' + ' ' + this.props.user.lastName || '';
    let requesterEmail = this.props.user.email;
    let profileImage = this.props.user.profilePicture;

    let startDay = this.state.startDay !== '' ? this.state.startDay : '';
    let startMonth = this.state.startMonth !== '' ? this.state.startMonth : '';
    let startYear = this.state.startYear !== '' ? this.state.startYear : '';
    let interactionStartDate = '';
    if (startDay && startMonth && startYear) {
      interactionStartDate = new Date(startYear, startMonth, startDay);
      interactionStartDate = interactionStartDate.valueOf();
    }

    let endDay = this.state.endDay !== '' ? this.state.endDay : '';
    let endMonth = this.state.endMonth !== '' ? this.state.endMonth : '';
    let endYear = this.state.endYear !== '' ? this.state.endYear : '';
    let interactionEndDate = '';

    if (endDay && endMonth && endYear) {
      interactionEndDate = new Date(endYear, endMonth, endDay);
      interactionEndDate = interactionEndDate.valueOf();
      interactionEndDate = this.state.todaysDate ? '' : interactionEndDate;
    }

    let badge = this.state.badgesData.length > 0 ? this.state.badgesData : [];
    let certificate =
      this.state.certificatesData.length > 0 ? this.state.certificatesData : [];

    let asset = this.state.mediaData.length > 0 ? this.state.mediaData : [];

    let skills = [];
    if (this.state.skills.length > 0) {
      skills = this.state.skills.map(function(skill) {
        return { skillId: skill.value, label: skill.label };
      });
    }

    let recommenderTitle = this.state.recommenderTitle;

    let data = {
      competencyTypeId,
      level3Competency,
      level2Competency,
      userId,
      title,
      request,
      interactionStartDate,
      interactionEndDate,
      skills,
      badge,
      certificate,
      asset,
      firstName,
      lastName,
      email,
      recommenderId,
      stage,
      name,
      requesterEmail,
      profileImage,
      recommenderTitle,
      isActive
    };

    let self = this;

    spikeViewApiService('addRecommendation', data)
      .then(response => {
        if (response.data.status === 'Success') {
          // if (this.state.type === 1) {
          //   this.props.closeRecommendationComponent();
          // } else {
          //   self.closeRecommendationModal('save');
          // }
          self.setState({ isLoading: false, recommendationModal: false });
          self.props.getAchievementsByUser();
          self.props.getRecommendationsByUser();
          self.props.closeRecommendationComponent();
        }
      })
      .catch(error => {
        self.setState({ isLoading: false });
        console.log(error);
      });
  }

  closeImageModal = type => {
    this.setState({
      imagesModal: !this.state.imagesModal,
      type: type
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

  // handleMediaChange = event => {
  //   let mediaImgArray = this.state.mediaImgArray;
  //   let mediaImgPreview = this.state.mediaImgPreview;
  //   let file = event.target.files[0];
  //   if (file) {
  //     let reader = new FileReader();
  //     reader.readAsDataURL(event.target.files[0]);
  //     reader.onload = event => {
  //       mediaImgArray.push(file);
  //       mediaImgPreview.push(event.target.result);
  //       this.setState({
  //         mediaImgArray,
  //         mediaImgPreview
  //       });
  //     };

  //     if (mediaImgPreview.length === 3) {
  //       document.getElementById('media_2').classList.add('img-count--wrapper');
  //     }
  //   }
  // };

  // deleteBadge = index => {
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
    console.log(mediaObject);
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
          console.log(fileName);
          let uploadPath = `sv_${userId}/${albumName}/${fileName}`;
          console.log(uploadPath);
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

          console.log(mediaData);

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

  // uploadAchievementData(mediaObject) {
  //   let AzureStorage = window.AzureStorage;
  //   let sasToken = this.state.sasToken;
  //   let userId = this.state.userId;
  //   let badgesData = [];
  //   let certificatesData = [];
  //   let mediaData = [];
  //   let self = this;

  //   const blobService =
  //     AzureStorage &&
  //     AzureStorage.Blob.createBlobServiceWithSas(
  //       CONSTANTS.azureBlobURI,
  //       sasToken
  //     );

  //   function uploadFiles(uploadArray, albumName) {
  //     for (var index = 0; index < uploadArray.length; index++) {
  //       if (isValidURL(uploadArray[index]) === true) {
  //         let path = `${CONSTANTS.azureBlobURI}/${CONSTANTS.azureContainer}/`;
  //         if (albumName === CONSTANTS.badgeAlbum) {
  //           let imageName = uploadArray[index].replace(path, '');
  //           badgesData.push(imageName);
  //         }

  //         if (albumName === CONSTANTS.certificateAlbum) {
  //           let imageName = uploadArray[index].replace(path, '');
  //           certificatesData.push(imageName);
  //         }

  //         if (albumName === CONSTANTS.mediaAlbum) {
  //           let imageName = uploadArray[index].replace(path, '');
  //           mediaData.push(imageName);
  //         }
  //       } else {
  //         let fileName = generateTimestamp(uploadArray[index].name);
  //         let uploadPath = `sv_${userId}/${albumName}/${fileName}`;
  //         if (albumName === CONSTANTS.badgeAlbum) {
  //           badgesData.push(uploadPath);
  //         }

  //         if (albumName === CONSTANTS.certificateAlbum) {
  //           certificatesData.push(uploadPath);
  //         }

  //         if (albumName === CONSTANTS.mediaAlbum) {
  //           mediaData.push(uploadPath);
  //         }

  //         blobService &&
  //           blobService.createBlockBlobFromBrowserFile(
  //             CONSTANTS.azureContainer,
  //             uploadPath,
  //             uploadArray[index],
  //             (error, result) => {
  //               if (result) {
  //                 console.log(result);
  //               }
  //               if (error) {
  //                 console.log('error ', error);
  //               }
  //             }
  //           );
  //       }
  //     }

  //     if (albumName === CONSTANTS.badgeAlbum) {
  //       console.log(badgesData);
  //       self.setState({ badgesData: badgesData });
  //     }

  //     if (albumName === CONSTANTS.certificateAlbum) {
  //       console.log(certificatesData);
  //       self.setState({ certificatesData });
  //     }

  //     if (albumName === CONSTANTS.mediaAlbum) {
  //       console.log(mediaData);
  //       self.setState({ mediaData });
  //     }
  //   }
  //   uploadFiles(mediaObject.badge, CONSTANTS.badgeAlbum);
  //   uploadFiles(mediaObject.certificate, CONSTANTS.certificateAlbum);
  //   uploadFiles(mediaObject.media, CONSTANTS.mediaAlbum);
  // }

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
              file: '',
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
        todaysDate: true,
        toDate: '',
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
  };

  render() {
    const CalendarContainer = ({ children }) => {
      console.log({ children });
      const el = document.getElementById('calendar-portal');
      return <Portal container={el}>{children}</Portal>;
    };

    return (
      <React.Fragment>
        <Modal
          bsSize="large"
          show={this.state.recommendationModal}
          onHide={this.closeRecommendationModal}
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
              Request Recommendation
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.state.imageSource ? (
              <ImageCropper
                imageSource={this.state.imageSource}
                imageName={this.state.imageName}
                imageType={this.state.imageType}
                aspectRatio={this.state.action === 1 ? 1 / 1 : 16 / 9}
                modalSize={'medium'}
                cropBoxWidth={this.state.action === 1 ? '300' : '700'}
                cropBoxHeight={this.state.action === 1 ? '300' : '700'}
                uploadImageToAzure={this.handleMediaChange.bind(this)}
                labelName={'ADD_MEDIA'}
              />
            ) : null}
            <Form horizontal className="lightBgForm">
              <Col sm={10}>
                <div className="flex align-center mb-10">
                  <Col componentClass={ControlLabel} sm={3}>
                    <strong>Recommender</strong>
                  </Col>
                  <Col sm={9}>
                    <div className="border-line" />
                  </Col>
                </div>

                <FormGroup className={this.getClasses('recommenderTitle')}>
                  <Col componentClass={ControlLabel} sm={3}>
                    Recommender Title
                  </Col>
                  <Col sm={9}>
                    <FormControl
                      type="text"
                      placeholder="Recommender Title"
                      name="recommenderTitle"
                      value={this.state.recommenderTitle}
                      onChange={this.handleChange}
                      autoComplete="off"
                      maxLength="50"
                    />
                    {renderMessage(
                      this.props.getValidationMessages('recommenderTitle')
                    )}
                  </Col>
                </FormGroup>

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
                    />
                    {renderMessage(
                      this.props.getValidationMessages('lastName')
                    )}
                  </Col>
                </FormGroup>

                <FormGroup className={this.getClasses('email')}>
                  <Col componentClass={ControlLabel} sm={3}>
                    Email Address
                  </Col>
                  <Col sm={9}>
                    <FormControl
                      type="Email"
                      placeholder=" Email"
                      name="email"
                      value={this.state.email}
                      onChange={this.handleChange}
                      autoComplete="off"
                    />
                    {renderMessage(this.props.getValidationMessages('email'))}
                  </Col>
                </FormGroup>

                <div className="flex align-center mb-10">
                  <Col componentClass={ControlLabel} sm={3}>
                    <strong>Recommendation</strong>
                  </Col>
                  <Col sm={9}>
                    <div className="border-line" />
                  </Col>
                </div>

                <FormGroup
                  controlId="formControlsTextarea"
                  className={this.getClasses('title')}
                >
                  <Col componentClass={ControlLabel} sm={3}>
                    <ControlLabel>Title</ControlLabel>
                  </Col>
                  <Col sm={9}>
                    <FormControl
                      placeholder="Enter Title"
                      name="title"
                      value={this.state.title}
                      onChange={this.handleChange}
                      autoComplete="off"
                      maxLength="50"
                    />
                    {renderMessage(this.props.getValidationMessages('title'))}
                  </Col>
                </FormGroup>
                <FormGroup
                  controlId="formControlsTextarea"
                  className={this.getClasses('request')}
                >
                  <Col componentClass={ControlLabel} sm={3}>
                    <ControlLabel>Request</ControlLabel>
                  </Col>
                  <Col sm={9}>
                    <FormControl
                      componentClass="textarea"
                      placeholder="Enter Here"
                      name="request"
                      value={this.state.request}
                      onChange={this.handleChange}
                      autoComplete="off"
                      maxLength="1000"
                    />
                    {renderMessage(this.props.getValidationMessages('request'))}
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
                                <option value="" key="">
                                  Select Competency
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
                        placeholder="Select Skills"
                      />
                    </div>
                    {renderMessage(this.props.getValidationMessages('skills'))}
                  </Col>
                </FormGroup>

                <FormGroup className="addDateInput">
                  <Col componentClass={ControlLabel} sm={3}>
                    Date From
                  </Col>
                  <Col sm={9}>
                    <div className="dob">
                      {' '}
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

                {/* <FormGroup>
                  <Col componentClass={ControlLabel} sm={3}>
                    Interaction From to Date
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
                              dateFormat="DD-MMM-YYYY"
                              scrollableYearDropdown
                              yearDropdownItemNumber={8}
                            />

                            <InputGroup.Addon>
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

                {/* <div>
                  <div ref="container" />
                </div> */}

                {/* <FormGroup className="flex align-center mb-0">
                  <Col componentClass={ControlLabel} sm={3}>
                    <strong>Upload Badges (Optional)</strong>
                  </Col>
                  <Col sm={9}>
                    <div className="border-line" />
                  </Col>
                </FormGroup>

                <FormGroup>
                  <Col smOffset={3} sm={9}>
                    <div className="add-more-boxes--wrapper">
                      <div className="amb--item amb--item--images">
                        {this.state.badgeImgPreview.length > 0
                          ? this.state.badgeImgPreview.map((image, index) => (
                              <div
                                className="amb-item--item"
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
                          //accept="image/*"
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
                </FormGroup>

                <FormGroup className="flex align-center mb-0">
                  <Col componentClass={ControlLabel} sm={3}>
                    <strong>Upload Certificate (Optional)</strong>
                  </Col>
                  <Col sm={9}>
                    <div className="border-line" />
                  </Col>
                </FormGroup>

                <FormGroup>
                  <Col smOffset={3} sm={9}>
                    <div className="add-more-boxes--wrapper">
                      <div className="amb--item amb--item--images">
                        {this.state.certificateImgPreview.length > 0
                          ? this.state.certificateImgPreview.map(
                              (image, index) => (
                                <div
                                  className="amb-item--item"
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

                <div className="mb-0">
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
                          //accept="image/* video/*"
                          accept="image/*"
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
              onClick={this.closeRecommendationModal}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          //bsSize="medium"
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

const mapStateToProps = state => {
  return {
    user: state.User.userData
  };
};

addRecommendation = validation(strategy)(addRecommendation);
export default connect(
  mapStateToProps,
  null
)(addRecommendation);
